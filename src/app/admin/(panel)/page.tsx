import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { AdminHeader, StatusBadge, TYPE_LABEL, formatDate } from "@/components/admin/bits";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const showLeads = can.leads(user.role);

  const weekAgo = daysAgo(7);
  const [newLeads, weekLeads, byType, recent, products, solutions] = await Promise.all([
    showLeads ? db.lead.count({ where: { status: "NEW" } }) : 0,
    showLeads ? db.lead.count({ where: { createdAt: { gte: weekAgo } } }) : 0,
    showLeads ? db.lead.groupBy({ by: ["type"], _count: true, where: { status: { notIn: ["WON", "LOST", "CLOSED"] } } }) : [],
    showLeads ? db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : [],
    db.product.count({ where: { published: true } }),
    db.solution.count({ where: { published: true } }),
  ]);

  const stats = [
    ...(showLeads
      ? [
          { label: "New leads to handle", value: newLeads, href: "/admin/leads?status=NEW" },
          { label: "Leads in the last 7 days", value: weekLeads, href: "/admin/leads" },
        ]
      : []),
    { label: "Published products", value: products, href: "/admin/products" },
    { label: "Published software", value: solutions, href: "/admin/solutions" },
  ];

  return (
    <>
      <AdminHeader title={`Hello, ${user.name.split(" ")[0]}`} intro="Here's what's happening on the website." />
      {denied && (
        <p className="mb-6 rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-700">
          Your role doesn&apos;t have access to that page.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:border-coral-200">
            <p className="font-display text-3xl font-bold text-ink-950">{s.value}</p>
            <p className="mt-1 text-sm text-ink-600">{s.label}</p>
          </Link>
        ))}
      </div>

      {showLeads && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
          <section className="card p-5">
            <h2 className="font-semibold">Open leads by type</h2>
            <ul className="mt-4 space-y-3">
              {(["QUOTE", "DEMO", "CONTACT", "PARTNER"] as const).map((t) => {
                const n = byType.find((b) => b.type === t)?._count ?? 0;
                return (
                  <li key={t}>
                    <Link href={`/admin/leads?type=${t}`} className="flex items-center justify-between text-sm hover:text-coral-600">
                      <span>{TYPE_LABEL[t]}</span>
                      <span className="font-semibold">{n}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Latest leads</h2>
              <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-coral-600">
                All leads <ArrowRight className="size-4" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 pb-6 text-sm text-ink-500">No leads yet. They appear here when visitors send a form.</p>
            ) : (
              <ul className="divide-y divide-ink-100 border-t border-ink-100">
                {recent.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-paper-50">
                      <span className="w-16 shrink-0 text-xs font-semibold text-ink-500">{TYPE_LABEL[l.type]}</span>
                      <span className="min-w-0 flex-1 truncate">
                        <strong>{l.institution ?? l.name}</strong> <span className="text-ink-500">· {l.name}</span>
                      </span>
                      <StatusBadge status={l.status} />
                      <span className="hidden w-36 shrink-0 text-right text-xs text-ink-500 sm:block">{formatDate(l.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
