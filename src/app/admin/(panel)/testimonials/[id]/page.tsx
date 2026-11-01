import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { ActionForm, ConfirmSubmit, Submit } from "@/components/admin/action-form";
import { ACheck, AField, AText } from "@/components/admin/bits";
import { BackLink } from "@/components/admin/list";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/actions/content";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({ params }: PageProps<"/admin/testimonials/[id]">) {
  await requireUser(can.content);
  const { id } = await params;
  const t = id === "new" ? null : await db.testimonial.findUnique({ where: { id } });
  if (id !== "new" && !t) notFound();

  return (
    <>
      <BackLink href="/admin/testimonials" label="Testimonials" />
      <h1 className="mt-4 text-2xl font-semibold">{t ? "Edit testimonial" : "Add testimonial"}</h1>
      <ActionForm action={saveTestimonial} className="card mt-6 space-y-5 p-6">
        <input type="hidden" name="id" value={t?.id ?? "new"} />
        <div className="grid gap-4 sm:grid-cols-3">
          <AField label="Name" name="name" required defaultValue={t?.name} />
          <AField label="Role" name="role" defaultValue={t?.role} placeholder="Principal" />
          <AField label="Institution" name="institution" required defaultValue={t?.institution} />
        </div>
        <AText label="Quote" name="quote" required rows={4} defaultValue={t?.quote} />
        <AField label="Order" name="order" type="number" defaultValue={t?.order ?? 0} />
        <ACheck label="Published on the home page" name="published" defaultChecked={t?.published ?? false} />
        <Submit>Save</Submit>
      </ActionForm>
      {t && (
        <form action={deleteTestimonial} className="mt-4 px-1">
          <input type="hidden" name="id" value={t.id} />
          <ConfirmSubmit message="Delete this testimonial?">Delete this testimonial</ConfirmSubmit>
        </form>
      )}
    </>
  );
}
