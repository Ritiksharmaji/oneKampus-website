import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { ActionForm, ConfirmSubmit, Submit } from "@/components/admin/action-form";
import { AField, ASelect, AText } from "@/components/admin/bits";
import { BackLink } from "@/components/admin/list";
import { ICON_NAMES } from "@/components/icon";
import { deleteCategory, saveCategory } from "@/app/admin/actions/content";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  await requireUser(can.content);
  const { id } = await params;
  const c = id === "new" ? null : await db.productCategory.findUnique({ where: { id } });
  if (id !== "new" && !c) notFound();

  return (
    <>
      <BackLink href="/admin/categories" label="Categories" />
      <h1 className="mt-4 text-2xl font-semibold">{c ? `Edit ${c.name}` : "Add category"}</h1>
      <ActionForm action={saveCategory} className="card mt-6 space-y-5 p-6">
        <input type="hidden" name="id" value={c?.id ?? "new"} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AField label="Name" name="name" required defaultValue={c?.name} />
          <AField label="URL slug" name="slug" defaultValue={c?.slug} hint="Leave empty to create it from the name." />
        </div>
        <AText label="Description" name="description" rows={3} defaultValue={c?.description} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ASelect label="Icon" name="icon" defaultValue={c?.icon ?? "Box"} options={ICON_NAMES.map((n) => ({ value: n, label: n }))} />
          <AField label="Order" name="order" type="number" defaultValue={c?.order ?? 0} />
        </div>
        <Submit>Save</Submit>
      </ActionForm>
      {c && (
        <ActionForm action={deleteCategory} className="mt-4 px-1">
          <input type="hidden" name="id" value={c.id} />
          <ConfirmSubmit message={`Delete ${c.name}?`}>Delete this category</ConfirmSubmit>
        </ActionForm>
      )}
    </>
  );
}
