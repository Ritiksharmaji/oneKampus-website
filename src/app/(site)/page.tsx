import Link from "next/link";
import { ArrowRight, Boxes, ClipboardList, Laptop, PackageCheck, Quote, Sparkles, Wrench } from "lucide-react";
import {
  getCategories, getFeaturedProducts, getServices, getSettings, getSolutions, getTestimonials,
} from "@/lib/content";
import { ProductCard, SolutionCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { Icon, SolutionIcon } from "@/components/icon";
import { ButtonLink, SectionHeading } from "@/components/ui";

export default async function HomePage() {
  const [settings, solutions, categories, featured, services, testimonials] = await Promise.all([
    getSettings(), getSolutions(), getCategories(), getFeaturedProducts(), getServices(), getTestimonials(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-gradient-to-b from-coral-50 via-paper-50 to-paper-50" />
        <div className="pointer-events-none absolute -right-32 top-10 size-[28rem] rounded-full bg-coral-200/40 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-paper-0 px-3 py-1 text-xs font-semibold text-coral-700">
              <Sparkles className="size-3.5" /> Software · Supplies · Services
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] sm:text-6xl">{settings.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg text-ink-600 sm:text-xl">{settings.heroSubtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/book-demo" size="lg">Book a free demo</ButtonLink>
              <ButtonLink href="/store" size="lg" variant="outline">
                Get a supplies quote <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>

          <HeroCollage solutions={solutions} categories={categories} />
        </div>
      </section>

      {/* Stats */}
      <section className="container-x">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-ink-100 lg:grid-cols-4">
          {settings.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse bg-paper-0 px-6 py-7">
              <dt className="mt-1 text-sm text-ink-600">{s.label}</dt>
              <dd className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Pillars */}
      <section className="container-x mt-24">
        <SectionHeading
          center
          eyebrow="What we do"
          title="One partner for your whole campus"
          intro="Most institutes juggle a software vendor, a printer, a uniform supplier and a stationery shop. With oneKampus it's one call."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Laptop, title: "Software", text: "Run the institute, teach online, conduct exams and hire staff — one login, web and mobile.", href: "/solutions", cta: "See the software" },
            { icon: Boxes, title: "Kampus Store", text: "Notebooks, uniforms, stationery, ID cards and diaries — printed with your name and logo.", href: "/store", cta: "Browse the store" },
            { icon: Wrench, title: "Services", text: "Setup, data migration, training, printing and smart-classroom infrastructure.", href: "/services", cta: "See services" },
          ].map((p) => (
            <Link key={p.title} href={p.href} className="card group p-7 transition hover:border-coral-200 hover:shadow-xl hover:shadow-ink-950/5">
              <span className="grid size-12 place-items-center rounded-2xl bg-coral-50 text-coral-600">
                <p.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-ink-600">{p.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-coral-600">
                {p.cta} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Software */}
      <section className="container-x mt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="oneKampus software"
            title="Run, teach, examine and hire — on one platform"
            intro="Every product shares one sign-in and one mobile app, so staff, parents and students learn it once."
          />
          <ButtonLink href="/solutions" variant="outline">All software</ButtonLink>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => <SolutionCard key={s.id} solution={s} />)}
        </div>
      </section>

      {/* Store */}
      <section className="mt-24 bg-paper-100 py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Kampus Store"
              title="Supplies, custom-made for your institute"
              intro="Order in bulk at institute prices. Add items to your quote basket and we'll send a quotation within one working day."
            />
            <ButtonLink href="/store" variant="dark">Open the store</ButtonLink>
          </div>
          <div className="mt-10 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/store/category/${c.slug}`}
                className="card flex min-w-40 flex-col items-start gap-3 p-4 transition hover:border-coral-200"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-coral-50 text-coral-600">
                  <Icon name={c.icon} className="size-5" />
                </span>
                <span className="text-sm font-semibold leading-tight text-ink-900">{c.name}</span>
                <span className="text-xs text-ink-500">{c._count.products} items</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x mt-24">
        <SectionHeading center eyebrow="How it works" title="From first call to a running campus" />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardList, title: "Tell us what you need", text: "Book a demo for software or send a quote basket for supplies." },
            { icon: Laptop, title: "See it working", text: "We show the software with your use case and share samples of printed items." },
            { icon: Wrench, title: "We set everything up", text: "Accounts, data import and branding — and production of your supplies." },
            { icon: PackageCheck, title: "Go live & get support", text: "Training for your staff, delivery to your campus and ongoing support." },
          ].map((step, i) => (
            <li key={step.title} className="card relative p-6">
              <span className="font-display text-5xl font-bold text-coral-100">{String(i + 1).padStart(2, "0")}</span>
              <step.icon className="absolute right-6 top-7 size-6 text-coral-500" />
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Services */}
      <section className="container-x mt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Services" title="Hands-on help, not just products" />
          <ButtonLink href="/services" variant="outline">All services</ButtonLink>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((s) => (
            <Link key={s.id} href={`/services#${s.slug}`} className="card p-5 transition hover:border-coral-200">
              <Icon name={s.icon} className="size-6 text-coral-500" />
              <h3 className="mt-4 font-semibold">{s.name}</h3>
              <p className="mt-1.5 text-sm text-ink-600">{s.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials (only when real ones are published in admin) */}
      {testimonials.length > 0 && (
        <section className="container-x mt-24">
          <SectionHeading center eyebrow="Institutes on oneKampus" title="What our partners say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="card p-6">
                <Quote className="size-6 text-coral-400" />
                <blockquote className="mt-4 text-ink-800">{t.quote}</blockquote>
                <figcaption className="mt-5 text-sm">
                  <strong className="text-ink-950">{t.name}</strong>
                  <span className="text-ink-500"> · {t.role}, {t.institution}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}

function HeroCollage({
  solutions, categories,
}: {
  solutions: Awaited<ReturnType<typeof getSolutions>>;
  categories: Awaited<ReturnType<typeof getCategories>>;
}) {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="card relative rotate-1 p-6 shadow-2xl shadow-ink-950/10">
        <p className="eyebrow">Software</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {solutions.slice(0, 6).map((s) => (
            <Link key={s.id} href={`/solutions/${s.slug}`} className="flex flex-col items-center gap-2 rounded-2xl p-3 text-center hover:bg-paper-100">
              <SolutionIcon icon={s.icon} size={52} />
              <span className="text-xs font-semibold text-ink-800">{s.name.replace("oneKampus ", "")}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="card relative -mt-4 ml-8 -rotate-1 p-6 shadow-2xl shadow-ink-950/10 sm:ml-16">
        <p className="eyebrow">Kampus Store</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/store/category/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-coral-50 hover:text-coral-700"
            >
              <Icon name={c.icon} className="size-3.5" /> {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
