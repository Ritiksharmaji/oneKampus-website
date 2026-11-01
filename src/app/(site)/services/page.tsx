import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getServices } from "@/lib/content";
import { CtaBand } from "@/components/cta-band";
import { Icon } from "@/components/icon";
import { ButtonLink, PageHeader } from "@/components/ui";
import { reveal } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Services for institutes",
  description: "Printing and branding, software setup and data migration, staff training, smart classrooms and event supplies — oneKampus services for schools and colleges.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="We don't just sell — we set it up with you"
        intro="From importing your student data to printing your annual-day certificates, our team does the work so your staff don't have to."
      />
      <section className="container-x mt-14 space-y-5">
        {services.map((s, i) => (
          <article
            key={s.id}
            id={s.slug}
            {...reveal(i)}
            className="card grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_1fr] md:items-start"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-coral-50 text-coral-600">
              <Icon name={s.icon} className="size-7" />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-400">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-2xl font-semibold">{s.name}</h2>
              <p className="mt-2 text-ink-600">{s.summary}</p>
            </div>
            <ul className="space-y-2.5">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2 text-ink-800">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-mint-500" /> {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
        <div className="pt-4 text-center">
          <ButtonLink href="/contact?topic=services" size="lg">Talk to us about a service</ButtonLink>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
