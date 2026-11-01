import "server-only";
import { randomBytes } from "node:crypto";
import type { LeadType } from "@prisma/client";
import { db } from "@/lib/db";
import { emailLayout, escapeHtml, sendMail } from "@/lib/mail";
import { siteUrl } from "@/lib/site";
import type { LeadInput } from "@/lib/lead-schema";
import type { QuoteItem } from "@/lib/types";

export const LEAD_LABELS: Record<LeadType, string> = {
  QUOTE: "Quote request",
  DEMO: "Demo booking",
  CONTACT: "Contact message",
  PARTNER: "Partner enquiry",
};

const PREFIX: Record<LeadType, string> = { QUOTE: "OKQ", DEMO: "OKD", CONTACT: "OKC", PARTNER: "OKP" };

function newRef(type: LeadType) {
  // e.g. OKQ-26K7F3QX — short, readable over the phone, unique enough with the DB constraint.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${PREFIX[type]}-${String(new Date().getFullYear()).slice(2)}${code}`;
}

export async function createLead(input: LeadInput) {
  const solution =
    input.type === "DEMO" && input.solution
      ? await db.solution.findUnique({ where: { slug: input.solution }, select: { id: true, name: true } })
      : null;

  const data = {
    type: input.type,
    name: input.name,
    email: input.email,
    phone: input.phone,
    institution: input.institution || null,
    city: input.city || null,
    message: input.message || null,
    solutionId: solution?.id ?? null,
    preferredDate: input.type === "DEMO" && input.preferredDate ? new Date(input.preferredDate) : null,
    items: input.type === "QUOTE" ? input.items : undefined,
    source: input.source,
  };

  for (let attempt = 0; ; attempt++) {
    try {
      const lead = await db.lead.create({ data: { ...data, ref: newRef(input.type) } });
      return { lead, solutionName: solution?.name };
    } catch (e) {
      // Retry the rare reference collision (unique constraint), give up on anything else.
      if (attempt < 3 && (e as { code?: string }).code === "P2002") continue;
      throw e;
    }
  }
}

type CreatedLead = Awaited<ReturnType<typeof createLead>>;

/** Alerts the sales team and confirms receipt to the visitor. Never throws. */
export async function notifyLead({ lead, solutionName }: CreatedLead) {
  const label = LEAD_LABELS[lead.type];
  const items = (lead.items as QuoteItem[] | null) ?? [];

  const rows: [string, string | null | undefined][] = [
    ["Reference", lead.ref],
    ["Name", lead.name],
    ["Institution", lead.institution],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["City", lead.city],
    ["Software", solutionName],
    ["Preferred date", lead.preferredDate?.toDateString()],
    ["Message", lead.message],
  ];
  const detailTable = `<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#6A7092;vertical-align:top">${k}</td><td><strong>${escapeHtml(String(v))}</strong></td></tr>`)
    .join("")}</table>`;

  const itemsTable = items.length
    ? `<h2 style="font-size:16px;margin:24px 0 8px">Items</h2><table cellpadding="8" style="border-collapse:collapse;font-size:14px;width:100%">
        <tr style="background:#F5F3EE;text-align:left"><th>Product</th><th>Options</th><th>Qty</th></tr>
        ${items
          .map(
            (i) => `<tr style="border-top:1px solid #ECEDF3"><td>${escapeHtml(i.name)}${
              i.customization ? `<br><span style="color:#6A7092">Custom: ${escapeHtml(i.customization)}</span>` : ""
            }</td><td>${escapeHtml(Object.entries(i.options).map(([k, v]) => `${k}: ${v}`).join(", ") || "—")}</td><td>${i.qty.toLocaleString("en-IN")} ${escapeHtml(i.unit)}s</td></tr>`,
          )
          .join("")}
      </table>`
    : "";

  const team = process.env.LEADS_NOTIFY_EMAIL;
  const jobs: Promise<unknown>[] = [];

  if (team) {
    jobs.push(
      sendMail({
        to: team,
        replyTo: lead.email,
        subject: `New ${label.toLowerCase()} ${lead.ref} — ${lead.institution ?? lead.name}`,
        html: emailLayout(
          `New ${label.toLowerCase()}`,
          `${detailTable}${itemsTable}<p style="margin-top:24px"><a href="${siteUrl}/admin/leads/${lead.id}" style="background:#FF6B57;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Open in admin</a></p>`,
        ),
      }),
    );
  }

  jobs.push(
    sendMail({
      to: lead.email,
      subject: `We received your ${label.toLowerCase()} (${lead.ref})`,
      html: emailLayout(
        `Thank you, ${lead.name.split(" ")[0]}!`,
        `<p style="font-size:15px;line-height:1.6">We've received your ${label.toLowerCase()} and our team will get back to you within one working day.
         Your reference number is <strong>${lead.ref}</strong>.</p>${itemsTable}
         <p style="font-size:15px;line-height:1.6;margin-top:24px">— Team oneKampus</p>`,
      ),
    }),
  );

  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === "rejected") console.error("[mail] failed:", r.reason);
}
