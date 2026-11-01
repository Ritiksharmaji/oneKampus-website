import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { ActionForm, ConfirmSubmit, Submit } from "@/components/admin/action-form";
import { LEAD_STATUSES, StatusBadge, TYPE_LABEL, formatDate } from "@/components/admin/bits";
import { addLeadNote, deleteLead, updateLead } from "@/app/admin/actions/leads";
import type { QuoteItem } from "@/lib/types";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  const user = await requireUser(can.leads);
  const { id } = await params;
  const [lead, team] = await Promise.all([
    db.lead.findUnique({
      where: { id },
      include: {
        solution: { select: { name: true, slug: true } },
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      },
    }),
    db.user.findMany({ where: { active: true, role: { in: ["ADMIN", "SALES"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!lead) notFound();

  const items = (lead.items as QuoteItem[] | null) ?? [];
  const source = (lead.source as Record<string, string> | null) ?? {};
  const details: [string, React.ReactNode][] = [
    ["Institution", lead.institution],
    ["City", lead.city],
    ["Software", lead.solution?.name],
    ["Preferred date", lead.preferredDate?.toLocaleDateString("en-IN", { dateStyle: "medium" })],
    ["Received", formatDate(lead.createdAt)],
    ["Came from", Object.entries(source).map(([k, v]) => `${k}: ${v}`).join(" · ")],
  ];

  return (
    <>
      <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-ink-950">
        <ArrowLeft className="size-4" /> All leads
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{lead.institution ?? lead.name}</h1>
        <StatusBadge status={lead.status} />
      </div>
      <p className="mt-1 text-sm text-ink-500">
        {TYPE_LABEL[lead.type]} · <span className="font-mono">{lead.ref}</span>
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">{lead.name}</h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your oneKampus request ${lead.ref}`)}`} className="inline-flex items-center gap-1.5 font-semibold text-coral-700 hover:underline">
                <Mail className="size-4" /> {lead.email}
              </a>
              <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold text-coral-700 hover:underline">
                <Phone className="size-4" /> {lead.phone}
              </a>
            </div>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {details.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            {lead.message && (
              <div className="mt-5 rounded-xl bg-paper-100 p-4 text-sm">
                <p className="mb-1 text-ink-500">Message</p>
                <p className="whitespace-pre-line text-ink-900">{lead.message}</p>
              </div>
            )}
          </section>

          {items.length > 0 && (
            <section className="card overflow-x-auto">
              <h2 className="px-5 pt-5 font-semibold">Quote items</h2>
              <table className="mt-3 w-full min-w-[520px] text-sm">
                <thead className="border-y border-ink-100 text-left text-ink-500">
                  <tr><th className="px-5 py-2 font-medium">Product</th><th className="px-5 py-2 font-medium">Options</th><th className="px-5 py-2 text-right font-medium">Quantity</th></tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {items.map((i, n) => (
                    <tr key={n}>
                      <td className="px-5 py-3">
                        <Link href={`/store/${i.slug}`} target="_blank" className="font-semibold hover:text-coral-600">{i.name}</Link>
                        {i.customization && <span className="block text-xs text-ink-500">Custom: {i.customization}</span>}
                      </td>
                      <td className="px-5 py-3 text-ink-600">{Object.entries(i.options).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"}</td>
                      <td className="px-5 py-3 text-right font-semibold">{i.qty.toLocaleString("en-IN")} {i.unit}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="card p-5">
            <h2 className="font-semibold">Notes &amp; follow-ups</h2>
            <ActionForm action={addLeadNote} className="mt-3">
              <input type="hidden" name="id" value={lead.id} />
              <textarea name="body" rows={3} placeholder="Called the principal, sending samples on Monday…" className="input" />
              <div className="mt-2 flex justify-end"><Submit variant="dark">Add note</Submit></div>
            </ActionForm>
            <ul className="mt-4 space-y-3">
              {lead.notes.map((n) => (
                <li key={n.id} className="rounded-xl border border-ink-100 p-3 text-sm">
                  <p className="whitespace-pre-line text-ink-900">{n.body}</p>
                  <p className="mt-1.5 text-xs text-ink-500">{n.author?.name ?? "Deleted user"} · {formatDate(n.createdAt)}</p>
                </li>
              ))}
              {lead.notes.length === 0 && <li className="text-sm text-ink-500">No notes yet.</li>}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Status</h2>
            <ActionForm resetKey={lead.updatedAt.getTime()} action={updateLead} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <div>
                <label htmlFor="status" className="label">Stage</label>
                <select id="status" name="status" defaultValue={lead.status} className="input">
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="assignedToId" className="label">Assigned to</label>
                <select id="assignedToId" name="assignedToId" defaultValue={lead.assignedToId ?? ""} className="input">
                  <option value="">Nobody</option>
                  {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <Submit className="w-full">Save</Submit>
            </ActionForm>
          </section>

          {can.deleteLeads(user.role) && (
            <form action={deleteLead} className="px-1">
              <input type="hidden" name="id" value={lead.id} />
              <ConfirmSubmit message={`Delete lead ${lead.ref}? This cannot be undone.`}>Delete this lead</ConfirmSubmit>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
