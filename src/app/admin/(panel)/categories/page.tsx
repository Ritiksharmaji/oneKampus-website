import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/bits";
import { AdminTable, SavedNotice } from "@/components/admin/list";
import { Icon } from "@/components/icon";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireUser(can.content);
  const { saved } = await searchParams;
  const categories = await db.productCategory.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } });

  return (
    <>
      <AdminHeader title="Store categories" action={{ href: "/admin/categories/new", label: "Add category" }} />
      <SavedNotice saved={saved} />
      <AdminTable
        columns={["Name", "Icon", "URL", "Products", "Order"]}
        rows={categories.map((c) => ({
          href: `/admin/categories/${c.id}`,
          cells: [c.name, <Icon key="i" name={c.icon} className="size-5 text-coral-500" />, `/store/category/${c.slug}`, c._count.products, c.order],
        }))}
      />
    </>
  );
}
