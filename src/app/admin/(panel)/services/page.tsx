import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { AdminHeader, Published } from "@/components/admin/bits";
import { AdminTable, SavedNotice } from "@/components/admin/list";
import { Icon } from "@/components/icon";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage({ searchParams }: PageProps<"/admin/services">) {
  await requireUser(can.content);
  const { saved } = await searchParams;
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <AdminHeader title="Services" action={{ href: "/admin/services/new", label: "Add service" }} />
      <SavedNotice saved={saved} />
      <AdminTable
        columns={["Name", "Icon", "Order", "Status"]}
        rows={services.map((s) => ({
          href: `/admin/services/${s.id}`,
          cells: [s.name, <Icon key="i" name={s.icon} className="size-5 text-coral-500" />, s.order, <Published key="p" value={s.published} />],
        }))}
      />
    </>
  );
}
