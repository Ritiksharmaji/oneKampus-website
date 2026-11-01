import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarCheck, Clock, MonitorPlay } from "lucide-react";
import { getSolutions } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import { DemoForm } from "./demo-form";

export const metadata: Metadata = {
  title: "Book a free demo",
  description: "See oneKampus Manage, Learn, Assess and Hire in a free 30-minute demo tailored to your institute.",
  alternates: { canonical: "/book-demo" },
};

export default async function BookDemoPage() {
  const solutions = await getSolutions();
  const options = solutions.map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <>
      <PageHeader
        eyebrow="Free demo"
        title="See oneKampus with your own use case"
        intro="Pick a product and a day that suits you. A product specialist will call to confirm the time."
      />
      <section className="container-x mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-5">
          {[
            { icon: Clock, title: "30 minutes, online", text: "A live walkthrough over Google Meet or Zoom — or at your campus if you're nearby." },
            { icon: MonitorPlay, title: "Tailored to you", text: "We show the modules that matter for your institute type and size." },
            { icon: CalendarCheck, title: "No obligation", text: "Get pricing and a setup plan. Decide in your own time." },
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
        <Suspense fallback={<div className="card h-96 animate-pulse bg-paper-100" />}>
          <DemoForm solutions={options} />
        </Suspense>
      </section>
    </>
  );
}
