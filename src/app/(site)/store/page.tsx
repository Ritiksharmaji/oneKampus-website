import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/content";
import { StoreBrowser } from "@/components/store-browser";
import { StoreHeader } from "@/components/store-header";

export const metadata: Metadata = {
  title: "Kampus Store — school supplies in bulk",
  description: "Custom-printed notebooks, school uniforms, stationery, ID cards, bags and diaries for institutes. Add items to a quote basket and get a quotation within one working day.",
  alternates: { canonical: "/store" },
};

export default async function StorePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <StoreHeader />
      <section className="container-x mt-10">
        <StoreBrowser products={products} categories={categories} />
      </section>
    </>
  );
}
