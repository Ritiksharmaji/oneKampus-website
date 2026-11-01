import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Users } from "lucide-react";
import { getSolution, getSolutions } from "@/lib/content";
import { SolutionCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { SolutionIcon } from "@/components/icon";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSolution(slug);
  if (!s) return {};
  return {
    title: `${s.name} — ${s.tagline}`,
    description: s.summary,
    alternates: { canonical: `/solutions/${s.slug}` },
  };
}

export default async function SolutionPage({ params }: PageProps<"/solutions/[slug]">) {
  const { slug } = await params;
  const [solution, all] = await Promise.all([getSolution(slug), getSolutions()]);
  if (!solution) notFound();
  const others = all.filter((s) => s.slug !== solution.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: solution.name,
          description: solution.summary,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web, iOS, Android",
          url: `${siteUrl}/solutions/${solution.slug}`,
          publisher: { "@type": "Organization", name: "oneKampus" },
        }}
      />
      {solution.faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: solution.faqs.map((f) => ({
              "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}

      <section className="border-b border-ink-100 bg-gradient-to-b from-coral-50/70 to-paper-50">
        <div className="container-x grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <SolutionIcon icon={solution.icon} size={64} />
            <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">{solution.name}</h1>
            <p className="mt-3 text-xl text-ink-700">{solution.tagline}</p>
            <p className="mt-5 max-w-2xl text-lg text-ink-600">{solution.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/book-demo?solution=${solution.slug}`} size="lg">Book a demo</ButtonLink>
              {solution.appUrl && (
                <ButtonLink href={solution.appUrl} size="lg" variant="outline">Sign in</ButtonLink>
              )}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-500">
              <Users className="size-4" /> Built for
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {solution.audiences.map((a) => (
                <li key={a} className="rounded-full bg-paper-100 px-3 py-1.5 text-sm font-medium text-ink-800">{a}</li>
              ))}
            </ul>
            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-500">Highlights</h2>
            <ul className="mt-3 space-y-2">
              {solution.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-ink-800">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-mint-500" /> {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-x mt-20">
        <SectionHeading eyebrow="Features" title={`What you get with ${solution.name.replace("oneKampus ", "")}`} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solution.features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="block h-1 w-10 rounded-full bg-coral-500" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {solution.faqs.length > 0 && (
        <section className="container-x mt-20 max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions institutes ask" />
          <div className="mt-8 divide-y divide-ink-100 rounded-[var(--radius-card)] border border-ink-100 bg-paper-0">
            {solution.faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                  {f.q}
                  <span className="text-xl text-coral-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading eyebrow="Works together" title="Pairs well with" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => <SolutionCard key={s.id} solution={s} />)}
          </div>
        </section>
      )}

      <CtaBand title={`Try ${solution.name} for your institute`} />
    </>
  );
}
