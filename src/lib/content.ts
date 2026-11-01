// Cached reads for the public website. Admin changes call updateTag(CONTENT_TAG) to refresh them.
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Faq, Feature, PriceTier, ProductOption, SiteSettings, Spec } from "@/lib/types";

export const CONTENT_TAG = "content";

function cached() {
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cached();
  const row = await db.setting.findUnique({ where: { key: "site" } });
  return row?.value as SiteSettings;
}

export async function getSolutions() {
  "use cache";
  cached();
  return db.solution.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}

export async function getSolution(slug: string) {
  "use cache";
  cached();
  const s = await db.solution.findFirst({ where: { slug, published: true } });
  if (!s) return null;
  return { ...s, features: s.features as Feature[], faqs: s.faqs as Faq[] };
}

export async function getCategories() {
  "use cache";
  cached();
  return db.productCategory.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
}

function shapeProduct<T extends { priceTiers: unknown; options: unknown; specs: unknown }>(p: T) {
  return {
    ...p,
    priceTiers: p.priceTiers as PriceTier[],
    options: p.options as ProductOption[],
    specs: p.specs as Spec[],
  };
}

export type StoreProduct = Awaited<ReturnType<typeof getProducts>>[number];

export async function getProducts(categorySlug?: string) {
  "use cache";
  cached();
  const rows = await db.product.findMany({
    where: { published: true, ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
    include: { category: true },
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
  });
  return rows.map(shapeProduct);
}

export async function getFeaturedProducts() {
  "use cache";
  cached();
  const rows = await db.product.findMany({
    where: { published: true, featured: true },
    include: { category: true },
    orderBy: { order: "asc" },
    take: 8,
  });
  return rows.map(shapeProduct);
}

export async function getProduct(slug: string) {
  "use cache";
  cached();
  const p = await db.product.findFirst({ where: { slug, published: true }, include: { category: true } });
  return p ? shapeProduct(p) : null;
}

export async function getServices() {
  "use cache";
  cached();
  return db.service.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}

export async function getTestimonials() {
  "use cache";
  cached();
  return db.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}
