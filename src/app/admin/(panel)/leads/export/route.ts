import type { LeadStatus, LeadType } from "@prisma/client";
import { db } from "@/lib/db";
import { can, getCurrentUser } from "@/lib/auth";
import type { QuoteItem } from "@/lib/types";

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote everything; neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !can.leads(user.role)) return new Response("Forbidden", { status: 403 });

  const sp = new URL(request.url).searchParams;
  const type = sp.get("type") as LeadType | null;
  const status = sp.get("status") as LeadStatus | null;

  const leads = await db.lead.findMany({
    where: { ...(type && { type }), ...(status && { status }) },
    orderBy: { createdAt: "desc" },
    include: { solution: { select: { name: true } }, assignedTo: { select: { name: true } } },
  });

  const header = ["Ref", "Type", "Status", "Received", "Name", "Institution", "Email", "Phone", "City", "Software", "Preferred date", "Items", "Message", "Assigned to"];
  const rows = leads.map((l) => [
    l.ref, l.type, l.status, l.createdAt.toISOString(), l.name, l.institution, l.email, l.phone, l.city,
    l.solution?.name, l.preferredDate?.toISOString().slice(0, 10),
    ((l.items as QuoteItem[] | null) ?? []).map((i) => `${i.qty} × ${i.name}`).join("; "),
    l.message, l.assignedTo?.name,
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="onekampus-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
