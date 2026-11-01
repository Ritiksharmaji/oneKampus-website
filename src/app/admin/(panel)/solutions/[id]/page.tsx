import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { toLines } from "@/lib/form-data";
import { ActionForm, ConfirmSubmit, Submit } from "@/components/admin/action-form";
import { ACheck, AField, AText } from "@/components/admin/bits";
import { BackLink } from "@/components/admin/list";
import { ICON_NAMES } from "@/components/icon";
import { deleteSolution, saveSolution } from "@/app/admin/actions/content";
import type { Faq, Feature } from "@/lib/types";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Edit software" };

const BRAND_ICONS = ["manage", "learn", "assess", "hire", "store"].map((n) => `/brand/onekampus-${n}-icon.svg`).concat("/brand/onekampus-icon.svg");

export default async function EditSolutionPage({ params }: PageProps<"/admin/solutions/[id]">) {
  await requireUser(can.content);
  const { id } = await params;
  const s = id === "new" ? null : await db.solution.findUnique({ where: { id } });
  if (id !== "new" && !s) notFound();

  return (
    <>
      <BackLink href="/admin/solutions" label="Software" />
      <h1 className="mt-4 text-2xl font-semibold">{s ? `Edit ${s.name}` : "Add software"}</h1>

      <ActionForm action={saveSolution} className="card mt-6 space-y-5 p-6">
        <input type="hidden" name="id" value={s?.id ?? "new"} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AField label="Name" name="name" required defaultValue={s?.name} />
          <AField label="URL slug" name="slug" defaultValue={s?.slug} hint="Leave empty to create it from the name." />
        </div>
        <AField label="Tagline" name="tagline" required defaultValue={s?.tagline} />
        <AText label="Summary" name="summary" required rows={3} defaultValue={s?.summary} />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="icon" className="label">Icon</label>
            <input id="icon" name="icon" list="icon-options" defaultValue={s?.icon ?? "Globe"} className="input" />
            <datalist id="icon-options">
              {[...BRAND_ICONS, ...ICON_NAMES].map((i) => <option key={i} value={i} />)}
            </datalist>
            <p className="mt-1 text-xs text-ink-500">A brand icon path or an icon name.</p>
          </div>
          <AField label="Sign-in / app link" name="appUrl" type="url" defaultValue={s?.appUrl} placeholder="https://app.onekampus.com" />
          <AField label="Order" name="order" type="number" defaultValue={s?.order ?? 0} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AText label="Highlights" name="highlights" rows={4} defaultValue={s?.highlights.join("\n")} hint="One per line — shown on cards." />
          <AText label="Built for" name="audiences" rows={4} defaultValue={s?.audiences.join("\n")} hint="One audience per line." />
        </div>
        <AText label="Features" name="features" rows={8} mono defaultValue={toLines((s?.features as Feature[]) ?? [], "title", "description")} hint="One per line: Title | Description" />
        <AText label="FAQ" name="faqs" rows={5} mono defaultValue={toLines((s?.faqs as Faq[]) ?? [], "q", "a")} hint="One per line: Question | Answer" />
        <ACheck label="Published on the website" name="published" defaultChecked={s?.published ?? true} />
        <Submit>Save</Submit>
      </ActionForm>

      {s && (
        <form action={deleteSolution} className="mt-4 px-1">
          <input type="hidden" name="id" value={s.id} />
          <ConfirmSubmit message={`Delete ${s.name}? Demo leads keep their details but lose the link.`}>Delete this software</ConfirmSubmit>
        </form>
      )}
    </>
  );
}
