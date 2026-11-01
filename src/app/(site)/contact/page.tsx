import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Talk to oneKampus about software, school supplies or services for your institute.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const details = [
    { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    { icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Office", value: s.address },
    { icon: Clock, label: "Hours", value: s.hours },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you" intro="Questions about software, supplies or a partnership? Send us a message and we'll reply within one working day." />
      <section className="container-x mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-4">
          {details.map((d) => (
            <li key={d.label} className="card flex gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600"><d.icon className="size-5" /></span>
              <div>
                <p className="text-sm text-ink-500">{d.label}</p>
                {d.href ? (
                  <a href={d.href} className="font-semibold text-ink-950 hover:text-coral-600">{d.value}</a>
                ) : (
                  <p className="font-semibold text-ink-950">{d.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Suspense fallback={<div className="card h-96 animate-pulse bg-paper-100" />}>
          <ContactForm />
        </Suspense>
      </section>
    </>
  );
}
