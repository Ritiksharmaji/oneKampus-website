import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { imageSrc } from "@/lib/site";
import { can, requireUser } from "@/lib/auth";
import { toLines } from "@/lib/form-data";
import { ActionForm, ConfirmSubmit, Submit } from "@/components/admin/action-form";
import { ACheck, AField, ASelect, AText } from "@/components/admin/bits";
import { BackLink } from "@/components/admin/list";
import { deleteProduct, saveProduct } from "@/app/admin/actions/content";
import type { PriceTier, ProductOption, Spec } from "@/lib/types";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireUser(can.content);
  const { id } = await params;
  const [p, categories] = await Promise.all([
    id === "new" ? null : db.product.findUnique({ where: { id } }),
    db.productCategory.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (id !== "new" && !p) notFound();

  const tiers = (p?.priceTiers as PriceTier[]) ?? [];
  const options = (p?.options as ProductOption[]) ?? [];

  return (
    <>
      <BackLink href="/admin/products" label="Products" />
      <h1 className="mt-4 text-2xl font-semibold">{p ? `Edit ${p.name}` : "Add product"}</h1>

      <ActionForm action={saveProduct} className="card mt-6 space-y-5 p-6">
        <input type="hidden" name="id" value={p?.id ?? "new"} />
        <div className="grid gap-4 sm:grid-cols-3">
          <AField label="Name" name="name" required defaultValue={p?.name} />
          <ASelect label="Category" name="categoryId" defaultValue={p?.categoryId} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <AField label="URL slug" name="slug" defaultValue={p?.slug} hint="Leave empty to create it from the name." />
        </div>
        <AField label="Summary" name="summary" required defaultValue={p?.summary} hint="One line, shown on product cards." />
        <AText label="Description" name="description" rows={4} defaultValue={p?.description} />

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          {p?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc(p.image, 300)} alt="" className="size-28 rounded-xl border border-ink-100 object-cover" />
          ) : (
            <div className="grid size-28 place-items-center rounded-xl bg-paper-100 text-xs text-ink-500">No photo</div>
          )}
          <div className="space-y-2">
            <label htmlFor="imageFile" className="label">Photo</label>
            <input id="imageFile" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" className="block text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
            <p className="text-xs text-ink-500">JPG, PNG or WebP up to 5 MB. Without a photo the store shows the category icon.</p>
            {p?.image && <ACheck label="Remove photo" name="removeImage" />}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <AField label="Unit" name="unit" defaultValue={p?.unit ?? "piece"} hint="e.g. notebook, shirt, set" />
          <AField label="Minimum order" name="moq" type="number" defaultValue={p?.moq ?? 1} />
          <AField label="Order in list" name="order" type="number" defaultValue={p?.order ?? 0} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <AText label="Bulk prices (₹ per unit)" name="priceTiers" mono rows={4} defaultValue={toLines(tiers, "minQty", "price")} hint="One per line: minimum qty | price" />
          <AText label="Options" name="options" mono rows={4} defaultValue={options.map((o) => `${o.name} | ${o.values.join(", ")}`).join("\n")} hint="One per line: Name | value, value, value" />
          <AText label="Specifications" name="specs" mono rows={4} defaultValue={toLines((p?.specs as Spec[]) ?? [], "label", "value")} hint="One per line: Label | Value" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <AField label="Customisation note" name="customizationNote" defaultValue={p?.customizationNote} placeholder="Cover printed with your logo" />
          <ACheck label="Can be customised (logo, colours, printing)" name="customizable" defaultChecked={p?.customizable ?? false} />
        </div>
        <div className="flex flex-wrap gap-6">
          <ACheck label="Published in the store" name="published" defaultChecked={p?.published ?? true} />
          <ACheck label="Featured on the home page" name="featured" defaultChecked={p?.featured ?? false} />
        </div>
        <Submit>Save</Submit>
      </ActionForm>

      {p && (
        <form action={deleteProduct} className="mt-4 px-1">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmSubmit message={`Delete ${p.name}?`}>Delete this product</ConfirmSubmit>
        </form>
      )}
    </>
  );
}
