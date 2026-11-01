import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { AdminHeader, Published } from "@/components/admin/bits";
import { AdminTable, SavedNotice } from "@/components/admin/list";
import { SolutionIcon } from "@/components/icon";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Software" };

export default async function AdminSolutionsPage({ searchParams }: PageProps<"/admin/solutions">) {
  await requireUser(can.content);
  const { saved } = await searchParams;
  const solutions = await db.solution.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { leads: true } } } });

  return (
    <>
      <AdminHeader title="Software" intro="Products shown under Software on the website." action={{ href: "/admin/solutions/new", label: "Add software" }} />
      <SavedNotice saved={saved} />
      <AdminTable
        columns={["Name", "Icon", "URL", "Order", "Demo leads", "Status"]}
        rows={solutions.map((s) => ({
          href: `/admin/solutions/${s.id}`,
          cells: [s.name, <SolutionIcon key="i" icon={s.icon} size={28} />, `/solutions/${s.slug}`, s.order, s._count.leads, <Published key="p" value={s.published} />],
        }))}
      />
    </>
  );
}
