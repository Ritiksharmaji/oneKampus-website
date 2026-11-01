import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import type { LeadStatus, LeadType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { AdminHeader, LEAD_STATUSES, LEAD_TYPES, StatusBadge, TYPE_LABEL, formatDate } from "@/components/admin/bits";
import { buttonClass } from "@/components/ui";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 30;

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requireUser(can.leads);
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const type = one(sp.type) as LeadType | "";
  const status = one(sp.status) as LeadStatus | "";
  const q = one(sp.q).trim();
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const where: Prisma.LeadWhereInput = {
    ...(LEAD_TYPES.includes(type as LeadType) && { type: type as LeadType }),
    ...(LEAD_STATUSES.includes(status as LeadStatus) && { status: status as LeadStatus }),
    ...(q && {
      OR: ["ref", "name", "institution", "email", "phone", "city"].map((f) => ({
        [f]: { contains: q, mode: "insensitive" as const },
      })),
    }),
  };

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { name: true } }, solution: { select: { name: true } } },
    }),
    db.lead.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(type && { type }), ...(status && { status }), ...(q && { q }) });
    for (const [k, v] of Object.entries(patch)) p.set(k, String(v));
    return `?${p}`;
  };

  return (
    <>
      <AdminHeader title="Leads" intro="Quote requests, demo bookings and messages from the website." />

      <form className="card mb-4 flex flex-wrap items-end gap-3 p-4" method="get">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="label">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, institution, phone, ref…" className="input" />
        </div>
        <div>
          <label htmlFor="type" className="label">Type</label>
          <select id="type" name="type" defaultValue={type} className="input">
            <option value="">All types</option>
            {LEAD_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
          </select>
        </div>
        <button className={buttonClass("dark")}>Filter</button>
        <a href={`/admin/leads/export${qs({})}`} className={buttonClass("outline")}>
          <Download className="size-4" /> CSV
        </a>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-ink-100 text-left text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assigned</th>
              <th className="px-4 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-paper-50">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/leads/${l.id}`} className="font-semibold text-coral-700 hover:underline">{l.ref}</Link>
                </td>
                <td className="px-4 py-3">
                  {TYPE_LABEL[l.type]}
                  {l.solution && <span className="block text-xs text-ink-500">{l.solution.name}</span>}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink-950 hover:text-coral-600">{l.institution ?? l.name}</Link>
                  <span className="block text-xs text-ink-500">{l.name} · {l.phone}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3 text-ink-600">{l.assignedTo?.name ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-ink-500">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-500">No leads match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink-500">{total} leads · page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className={buttonClass("outline", "sm")}>Previous</Link>}
            {page < pages && <Link href={qs({ page: page + 1 })} className={buttonClass("outline", "sm")}>Next</Link>}
          </div>
        </div>
      )}
    </>
  );
}
