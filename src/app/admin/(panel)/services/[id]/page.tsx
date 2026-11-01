import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { ActionForm, ConfirmSubmit, Submit } from "@/components/admin/action-form";
import { ACheck, AField, ASelect, AText } from "@/components/admin/bits";
import { BackLink } from "@/components/admin/list";
import { ICON_NAMES } from "@/components/icon";
import { deleteService, saveService } from "@/app/admin/actions/content";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  await requireUser(can.content);
  const { id } = await params;
  const s = id === "new" ? null : await db.service.findUnique({ where: { id } });
  if (id !== "new" && !s) notFound();

  return (
    <>
      <BackLink href="/admin/services" label="Services" />
      <h1 className="mt-4 text-2xl font-semibold">{s ? `Edit ${s.name}` : "Add service"}</h1>
      <ActionForm action={saveService} className="card mt-6 space-y-5 p-6">
        <input type="hidden" name="id" value={s?.id ?? "new"} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AField label="Name" name="name" required defaultValue={s?.name} />
          <AField label="Anchor slug" name="slug" defaultValue={s?.slug} hint="Used for /services#slug links." />
        </div>
        <AField label="Summary" name="summary" required defaultValue={s?.summary} />
        <AText label="Points" name="points" rows={5} defaultValue={s?.points.join("\n")} hint="One per line." />
        <div className="grid gap-4 sm:grid-cols-2">
          <ASelect label="Icon" name="icon" defaultValue={s?.icon ?? "Box"} options={ICON_NAMES.map((n) => ({ value: n, label: n }))} />
          <AField label="Order" name="order" type="number" defaultValue={s?.order ?? 0} />
        </div>
        <ACheck label="Published on the website" name="published" defaultChecked={s?.published ?? true} />
        <Submit>Save</Submit>
      </ActionForm>
      {s && (
        <form action={deleteService} className="mt-4 px-1">
          <input type="hidden" name="id" value={s.id} />
          <ConfirmSubmit message={`Delete ${s.name}?`}>Delete this service</ConfirmSubmit>
        </form>
      )}
    </>
  );
}
