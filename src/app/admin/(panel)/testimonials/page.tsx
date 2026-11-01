import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { AdminHeader, Published } from "@/components/admin/bits";
import { AdminTable, SavedNotice } from "@/components/admin/list";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage({ searchParams }: PageProps<"/admin/testimonials">) {
  await requireUser(can.content);
  const { saved } = await searchParams;
  const testimonials = await db.testimonial.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <AdminHeader
        title="Testimonials"
        intro="Published testimonials appear on the home page. Only publish real quotes you have permission to use."
        action={{ href: "/admin/testimonials/new", label: "Add testimonial" }}
      />
      <SavedNotice saved={saved} />
      <AdminTable
        columns={["Name", "Institution", "Quote", "Status"]}
        rows={testimonials.map((t) => ({
          href: `/admin/testimonials/${t.id}`,
          cells: [t.name, t.institution, <span key="q" className="line-clamp-1 max-w-sm text-ink-600">{t.quote}</span>, <Published key="p" value={t.published} />],
        }))}
      />
    </>
  );
}
