import type { MetadataRoute } from "next";
import { getCategories, getProducts, getSolutions } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [solutions, categories, products] = await Promise.all([getSolutions(), getCategories(), getProducts()]);
  const page = (path: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority,
  });

  return [
    page("/", 1),
    page("/solutions", 0.9),
    page("/store", 0.9),
    page("/services", 0.8),
    page("/book-demo", 0.8),
    page("/about", 0.5),
    page("/contact", 0.5),
    page("/partners", 0.5),
    page("/privacy", 0.2),
    ...solutions.map((s) => ({ ...page(`/solutions/${s.slug}`, 0.8), lastModified: s.updatedAt })),
    ...categories.map((c) => page(`/store/category/${c.slug}`, 0.7)),
    ...products.map((p) => ({ ...page(`/store/${p.slug}`, 0.6), lastModified: p.updatedAt })),
  ];
}
