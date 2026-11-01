import type { Metadata } from "next";
import { getSolutions } from "@/lib/content";
import { SolutionCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Software for institutes",
  description: "Institute management (ERP), online learning (LMS), online exams, hiring and a mobile app — oneKampus software for schools, colleges and coaching institutes.",
  alternates: { canonical: "/solutions" },
};

export default async function SolutionsPage() {
  const solutions = await getSolutions();
  return (
    <>
      <PageHeader
        eyebrow="oneKampus software"
        title="Software that runs your whole institute"
        intro="Pick one product or use them all together — they share one sign-in, one mobile app and one support team."
      />
      <section className="container-x mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((s) => <SolutionCard key={s.id} solution={s} />)}
      </section>
      <CtaBand title="See it with your own data" text="Book a 30-minute demo and we'll walk you through the products that fit your institute." />
    </>
  );
}
