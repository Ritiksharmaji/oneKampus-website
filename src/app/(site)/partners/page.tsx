import type { Metadata } from "next";
import { BadgeIndianRupee, GraduationCap, Handshake } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = {
  title: "Become a oneKampus partner",
  description: "Sell oneKampus software and school supplies in your city as a distributor or reseller.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Grow with oneKampus in your city"
        intro="Already working with schools — as a stationery supplier, IT vendor or consultant? Offer them the full oneKampus range."
      />
      <section className="container-x mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-5">
          {[
            { icon: BadgeIndianRupee, title: "Earn on every sale", text: "Margins on store orders and recurring commission on software." },
            { icon: GraduationCap, title: "Training and material", text: "Product training, demo accounts, samples and brochures." },
            { icon: Handshake, title: "We handle delivery", text: "Production, setup and support are done by oneKampus." },
          ].map((b) => (
            <li key={b.title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600"><b.icon className="size-5" /></span>
              <div>
                <h2 className="font-semibold">{b.title}</h2>
                <p className="mt-1 text-sm text-ink-600">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <PartnerForm />
      </section>
    </>
  );
}
