import type { Metadata } from "next";
import { HeartHandshake, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/content";
import { CtaBand } from "@/components/cta-band";
import { PageHeader, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About oneKampus",
  description: "oneKampus is one partner for everything an educational institute needs — software, supplies and services.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Layers, title: "One partner, not five vendors", text: "Software, printing, uniforms and stationery from one team that knows your institute." },
  { icon: Sparkles, title: "Simple for every user", text: "Owners, teachers, parents and students learn one login and one app." },
  { icon: ShieldCheck, title: "Your data stays yours", text: "Your institute's data is kept private, backed up and exportable whenever you need it." },
  { icon: HeartHandshake, title: "Here after go-live", text: "Training, support and re-orders long after the first delivery." },
];

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Built for the people who run institutes"
        intro={`${settings.companyName} started with a simple idea: a school shouldn't need a different vendor for every problem. Today we build the software that runs institutes and supply the things students use every day.`}
      />

      <section className="container-x mt-16 grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Our mission" title="Make running an institute easier, end to end" />
          <div className="mt-6 space-y-4 text-lg text-ink-600">
            <p>
              Principals and administrators spend too much time on spreadsheets, follow-ups and chasing suppliers.
              We bring admissions, fees, attendance, online learning, exams and hiring into one platform — and
              take care of the physical supplies as well.
            </p>
            <p>
              Whether you are a single coaching centre or a group of schools, we start with what you need today
              and grow with you.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <v.icon className="size-6 text-coral-500" />
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand title="Let's work together" />
    </>
  );
}
