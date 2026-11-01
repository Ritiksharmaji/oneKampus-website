"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { bool, int, lines, optStr, pairs, slugify, splitLine, str } from "@/lib/form-data";
import { deleteImage, saveImage } from "@/lib/uploads";
import type { SiteSettings } from "@/lib/types";
import type { FormState } from "@/components/admin/action-form";

async function editor() {
  return requireUser(can.content);
}

/** Runs a save, turning duplicate-slug errors into a friendly message. */
async function save(run: () => Promise<unknown>): Promise<FormState | null> {
  try {
    await run();
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "That URL slug is already used. Pick another one." };
    throw e;
  }
  updateTag(CONTENT_TAG);
  return null;
}

const isNew = (id: string) => !id || id === "new";

// ---------- Software ----------

export async function saveSolution(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name || !str(fd, "tagline") || !str(fd, "summary")) return { error: "Name, tagline and summary are required." };

  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    tagline: str(fd, "tagline"),
    summary: str(fd, "summary"),
    icon: str(fd, "icon") || "Globe",
    highlights: lines(str(fd, "highlights")),
    audiences: lines(str(fd, "audiences")),
    features: pairs(str(fd, "features"), "title", "description"),
    faqs: pairs(str(fd, "faqs"), "q", "a"),
    appUrl: optStr(fd, "appUrl"),
    order: int(fd, "order"),
    published: bool(fd, "published"),
  };
  const err = await save(() =>
    isNew(id) ? db.solution.create({ data }) : db.solution.update({ where: { id }, data }),
  );
  if (err) return err;
  redirect("/admin/solutions?saved=1");
}

export async function deleteSolution(fd: FormData) {
  await editor();
  await db.solution.delete({ where: { id: str(fd, "id") } });
  updateTag(CONTENT_TAG);
  redirect("/admin/solutions");
}

// ---------- Products ----------

export async function saveProduct(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const categoryId = str(fd, "categoryId");
  if (!name || !categoryId || !str(fd, "summary")) return { error: "Name, category and summary are required." };

  const priceTiers = lines(str(fd, "priceTiers")).map(splitLine).map(([q, p]) => ({
    minQty: Number.parseInt(q, 10),
    price: Number(p),
  }));
  if (priceTiers.some((t) => !Number.isFinite(t.minQty) || !Number.isFinite(t.price) || t.minQty < 1 || t.price < 0)) {
    return { error: "Each price line must be “minimum quantity | price”, e.g. 500 | 32." };
  }
  priceTiers.sort((a, b) => a.minQty - b.minQty);

  const existing = isNew(id) ? null : await db.product.findUnique({ where: { id }, select: { image: true } });
  let image = existing?.image ?? null;
  const file = fd.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file);
    if ("error" in saved) return { error: saved.error };
    image = saved.url;
  } else if (bool(fd, "removeImage")) {
    image = null;
  }

  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    categoryId,
    summary: str(fd, "summary"),
    description: str(fd, "description"),
    image,
    specs: pairs(str(fd, "specs"), "label", "value"),
    options: lines(str(fd, "options"))
      .map(splitLine)
      .filter(([n, v]) => n && v)
      .map(([n, v]) => ({ name: n, values: v.split(",").map((x) => x.trim()).filter(Boolean) })),
    customizable: bool(fd, "customizable"),
    customizationNote: optStr(fd, "customizationNote"),
    moq: Math.max(1, int(fd, "moq", 1)),
    unit: str(fd, "unit") || "piece",
    priceTiers,
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    order: int(fd, "order"),
  };
  const err = await save(() =>
    isNew(id) ? db.product.create({ data }) : db.product.update({ where: { id }, data }),
  );
  if (err) return err;
  if (existing?.image && existing.image !== image) await deleteImage(existing.image);
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(fd: FormData) {
  await editor();
  const p = await db.product.delete({ where: { id: str(fd, "id") } });
  await deleteImage(p.image);
  updateTag(CONTENT_TAG);
  redirect("/admin/products");
}

// ---------- Categories ----------

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { error: "Name is required." };
  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    description: str(fd, "description"),
    icon: str(fd, "icon") || "Box",
    order: int(fd, "order"),
  };
  const err = await save(() =>
    isNew(id) ? db.productCategory.create({ data }) : db.productCategory.update({ where: { id }, data }),
  );
  if (err) return err;
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const id = str(fd, "id");
  if (await db.product.count({ where: { categoryId: id } })) {
    return { error: "Move or delete this category's products first." };
  }
  await db.productCategory.delete({ where: { id } });
  updateTag(CONTENT_TAG);
  redirect("/admin/categories");
}

// ---------- Services ----------

export async function saveService(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name || !str(fd, "summary")) return { error: "Name and summary are required." };
  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    summary: str(fd, "summary"),
    icon: str(fd, "icon") || "Box",
    points: lines(str(fd, "points")),
    order: int(fd, "order"),
    published: bool(fd, "published"),
  };
  const err = await save(() =>
    isNew(id) ? db.service.create({ data }) : db.service.update({ where: { id }, data }),
  );
  if (err) return err;
  redirect("/admin/services?saved=1");
}

export async function deleteService(fd: FormData) {
  await editor();
  await db.service.delete({ where: { id: str(fd, "id") } });
  updateTag(CONTENT_TAG);
  redirect("/admin/services");
}

// ---------- Testimonials ----------

export async function saveTestimonial(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const id = str(fd, "id");
  const data = {
    name: str(fd, "name"),
    role: str(fd, "role"),
    institution: str(fd, "institution"),
    quote: str(fd, "quote"),
    order: int(fd, "order"),
    published: bool(fd, "published"),
  };
  if (!data.name || !data.quote || !data.institution) return { error: "Name, institution and quote are required." };
  await (isNew(id) ? db.testimonial.create({ data }) : db.testimonial.update({ where: { id }, data }));
  updateTag(CONTENT_TAG);
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(fd: FormData) {
  await editor();
  await db.testimonial.delete({ where: { id: str(fd, "id") } });
  updateTag(CONTENT_TAG);
  redirect("/admin/testimonials");
}

// ---------- Site settings ----------

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await editor();
  const value: SiteSettings = {
    companyName: str(fd, "companyName") || "oneKampus",
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    address: str(fd, "address"),
    hours: str(fd, "hours"),
    heroTitle: str(fd, "heroTitle"),
    heroSubtitle: str(fd, "heroSubtitle"),
    stats: pairs(str(fd, "stats"), "value", "label"),
    social: pairs(str(fd, "social"), "label", "url"),
  };
  if (!value.email || !value.heroTitle) return { error: "Email and hero title are required." };
  await db.setting.upsert({ where: { key: "site" }, update: { value }, create: { key: "site", value } });
  updateTag(CONTENT_TAG);
  revalidatePath("/admin/settings");
  return { ok: "Settings saved. The website shows the new details now." };
}
