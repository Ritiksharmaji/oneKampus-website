import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { toLines } from "@/lib/form-data";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { AdminHeader, AField, AText } from "@/components/admin/bits";
import { saveSettings } from "@/app/admin/actions/content";
import type { SiteSettings } from "@/lib/types";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireUser(can.content);
  const row = await db.setting.findUnique({ where: { key: "site" } });
  const s = row?.value as SiteSettings | undefined;

  return (
    <>
      <AdminHeader title="Site settings" intro="Contact details, the home-page headline and stats." />
      <ActionForm resetKey={JSON.stringify(s)} action={saveSettings} className="card space-y-5 p-6">
        <h2 className="font-semibold">Contact details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AField label="Company name" name="companyName" defaultValue={s?.companyName} />
          <AField label="Email" name="email" type="email" required defaultValue={s?.email} />
          <AField label="Phone" name="phone" defaultValue={s?.phone} />
          <AField label="Office hours" name="hours" defaultValue={s?.hours} />
        </div>
        <AText label="Address" name="address" rows={2} defaultValue={s?.address} />

        <h2 className="pt-2 font-semibold">Home page</h2>
        <AField label="Headline" name="heroTitle" required defaultValue={s?.heroTitle} />
        <AText label="Sub-headline" name="heroSubtitle" rows={3} defaultValue={s?.heroSubtitle} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AText label="Stats" name="stats" mono rows={4} defaultValue={toLines(s?.stats ?? [], "value", "label")} hint="One per line: value | label (4 work best)" />
          <AText label="Social links" name="social" mono rows={4} defaultValue={toLines(s?.social ?? [], "label", "url")} hint="One per line: Label | https://…" />
        </div>
        <Submit>Save settings</Submit>
      </ActionForm>
    </>
  );
}
