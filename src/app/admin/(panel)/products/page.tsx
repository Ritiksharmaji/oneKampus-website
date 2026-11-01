import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { formatINR, startingPrice } from "@/lib/site";
import { AdminHeader, Published } from "@/components/admin/bits";
import { AdminTable, SavedNotice } from "@/components/admin/list";
import { Badge } from "@/components/ui";
import type { PriceTier } from "@/lib/types";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireUser(can.content);
  const { saved, category } = await searchParams;
  const [categories, products] = await Promise.all([
    db.productCategory.findMany({ orderBy: { order: "asc" } }),
    db.product.findMany({
      where: typeof category === "string" && category ? { category: { slug: category } } : {},
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
  ]);

  return (
    <>
      <AdminHeader title="Products" intro="Everything in the Kampus Store." action={{ href: "/admin/products/new", label: "Add product" }} />
      <SavedNotice saved={saved} />
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ slug: "", name: "All" }, ...categories].map((c) => (
          <Link
            key={c.slug}
            href={c.slug ? `/admin/products?category=${c.slug}` : "/admin/products"}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              (category ?? "") === c.slug ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-paper-0 text-ink-700",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <AdminTable
        columns={["Name", "Category", "From", "Min. order", "Status"]}
        rows={products.map((p) => {
          const from = startingPrice(p.priceTiers as PriceTier[]);
          return {
            href: `/admin/products/${p.id}`,
            cells: [
              p.name,
              p.category.name,
              from === null ? "—" : `${formatINR(from)} / ${p.unit}`,
              `${p.moq} ${p.unit}s`,
              <span key="s" className="flex gap-1.5"><Published value={p.published} />{p.featured && <Badge tone="amber">featured</Badge>}</span>,
            ],
          };
        })}
      />
    </>
  );
}
