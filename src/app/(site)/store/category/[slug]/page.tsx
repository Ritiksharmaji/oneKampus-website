import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/content";
import { StoreBrowser } from "@/components/store-browser";
import { StoreHeader } from "@/components/store-header";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/store/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} for schools and institutes`,
    description: category.description,
    alternates: { canonical: `/store/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/store/category/[slug]">) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts(slug)]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <StoreHeader title={category.name} intro={category.description} />
      <section className="container-x mt-10">
        <StoreBrowser products={products} categories={categories} activeCategory={slug} />
      </section>
    </>
  );
}
