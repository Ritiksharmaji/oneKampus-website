import Link from "next/link";
import { ArrowRight, Boxes, ClipboardList, Laptop, PackageCheck, Quote, Sparkles, Wrench } from "lucide-react";
import {
  getCategories, getFeaturedProducts, getServices, getSettings, getSolutions, getTestimonials,
  type StoreProduct,
} from "@/lib/content";
import { ProductCard, SolutionCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { Icon, SolutionIcon } from "@/components/icon";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { reveal } from "@/lib/motion";
import { imageSrc, siteUrl } from "@/lib/site";

const enter = (i: number) => ({ className: "enter", style: { "--d": `${i * 90}ms` } as React.CSSProperties });

export default async function HomePage() {
  const [settings, solutions, categories, featured, services, testimonials] = await Promise.all([
    getSettings(), getSolutions(), getCategories(), getFeaturedProducts(), getServices(), getTestimonials(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: settings.companyName,
          url: siteUrl,
          logo: `${siteUrl}/brand/onekampus-icon.svg`,
          email: settings.email,
          telephone: settings.phone,
          sameAs: settings.social.map((s) => s.url),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-gradient-to-b from-coral-50 via-paper-50 to-paper-50" />
        <div className="drift pointer-events-none absolute -right-32 top-10 size-[28rem] rounded-full bg-coral-200/40 blur-3xl" />
        <div className="container-x relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p {...enter(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-paper-0 px-3 py-1 text-xs font-semibold text-coral-700">
                <Sparkles className="size-3.5" /> Software · Supplies · Services
              </span>
            </p>
            <h1 {...enter(1)} className="enter mt-6 text-4xl font-bold leading-[1.08] sm:text-6xl">{settings.heroTitle}</h1>
            <p {...enter(2)} className="enter mt-6 max-w-xl text-lg text-ink-600 sm:text-xl">{settings.heroSubtitle}</p>
            <div {...enter(3)} className="enter mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/book-demo" size="lg">Book a free demo</ButtonLink>
              <ButtonLink href="/store" size="lg" variant="outline">
                Get a supplies quote <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>

          <HeroCollage solutions={solutions} products={featured} />
        </div>
      </section>

      {/* Stats */}
      <section className="container-x">
        <dl {...reveal()} className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-ink-100 lg:grid-cols-4">
          {settings.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse justify-end bg-paper-0 px-6 py-7">
              <dt className="mt-1.5 text-sm text-ink-600">{s.label}</dt>
              <dd className="font-display text-2xl font-bold whitespace-nowrap text-ink-950 xl:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Pillars */}
      <section className="container-x mt-28">
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
          ].map((p, i) => (
            <div key={p.title} {...reveal(i)}>
              <Link href={p.href} className="card group flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-coral-200 hover:shadow-xl hover:shadow-ink-950/5">
                <span className="grid size-12 place-items-center rounded-2xl bg-coral-50 text-coral-600 transition duration-300 group-hover:bg-coral-500 group-hover:text-white">
                  <p.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-ink-600">{p.text}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-coral-600">
                  {p.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Software */}
      <section className="container-x mt-28">
        <HeadingRow href="/solutions" label="All software">
          <SectionHeading
            eyebrow="oneKampus software"
            title="Run, teach, examine and hire — on one platform"
            intro="Every product shares one sign-in and one mobile app, so staff, parents and students learn it once."
          />
        </HeadingRow>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <div key={s.id} {...reveal(i)}><SolutionCard solution={s} /></div>
          ))}
        </div>
      </section>

      {/* Store */}
      <section className="mt-28 bg-paper-100 py-20">
        <div className="container-x">
          <HeadingRow href="/store" label="Open the store" dark>
            <SectionHeading
              eyebrow="Kampus Store"
              title="Supplies, custom-made for your institute"
              intro="Order in bulk at institute prices. Add items to your quote basket and we'll send a quotation within one working day."
            />
          </HeadingRow>
          <div className="mt-10 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {categories.map((c, i) => (
              <div key={c.id} {...reveal(i)} className="shrink-0">
                <Link
                  href={`/store/category/${c.slug}`}
                  className="card group flex h-full min-w-40 flex-col items-start gap-3 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-coral-200 hover:shadow-lg hover:shadow-ink-950/5"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-coral-50 text-coral-600 transition group-hover:bg-coral-500 group-hover:text-white">
                    <Icon name={c.icon} className="size-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-ink-900">{c.name}</span>
                  <span className="mt-auto text-xs text-ink-500">{c._count.products} items</span>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((p, i) => (
              <div key={p.id} {...reveal(i)}><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x mt-28">
        <SectionHeading center eyebrow="How it works" title="From first call to a running campus" />
        <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardList, title: "Tell us what you need", text: "Book a demo for software or send a quote basket for supplies." },
            { icon: Laptop, title: "See it working", text: "We show the software with your use case and share samples of printed items." },
            { icon: Wrench, title: "We set everything up", text: "Accounts, data import and branding — and production of your supplies." },
            { icon: PackageCheck, title: "Go live & get support", text: "Training for your staff, delivery to your campus and ongoing support." },
          ].map((step, i) => (
            <li key={step.title} {...reveal(i)}>
              <div className="card flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-bold text-coral-200">{String(i + 1).padStart(2, "0")}</span>
                  <span className="grid size-10 place-items-center rounded-xl bg-coral-50 text-coral-600">
                    <step.icon className="size-5" />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Services: 3 on the first row, 2 wider on the second */}
      <section className="container-x mt-28">
        <HeadingRow href="/services" label="All services">
          <SectionHeading eyebrow="Services" title="Hands-on help, not just products" />
        </HeadingRow>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => (
            <div key={s.id} {...reveal(i)} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}>
              <Link href={`/services#${s.slug}`} className="card group flex h-full gap-4 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-coral-200 hover:shadow-lg hover:shadow-ink-950/5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600 transition group-hover:bg-coral-500 group-hover:text-white">
                  <Icon name={s.icon} className="size-5" />
                </span>
                <span>
                  <span className="block font-display font-semibold text-ink-950">{s.name}</span>
                  <span className="mt-1 block text-sm text-ink-600">{s.summary}</span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials (only when real ones are published in admin) */}
      {testimonials.length > 0 && (
        <section className="container-x mt-28">
          <SectionHeading center eyebrow="Institutes on oneKampus" title="What our partners say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={t.id} {...reveal(i)} className="card p-6">
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

/** Section heading with its button aligned to the heading's last line. */
function HeadingRow({ children, href, label, dark }: { children: React.ReactNode; href: string; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      {children}
      <ButtonLink href={href} variant={dark ? "dark" : "outline"} className="shrink-0 self-start sm:self-end">
        {label} <ArrowRight className="size-4" />
      </ButtonLink>
    </div>
  );
}

function HeroCollage({
  solutions, products,
}: {
  solutions: Awaited<ReturnType<typeof getSolutions>>;
  products: StoreProduct[];
}) {
  const photos = products.filter((p) => p.image).slice(0, 3);
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div {...enter(2)} className="enter">
        <div className="float card p-6 shadow-2xl shadow-ink-950/10" style={{ "--rot": "1deg" } as React.CSSProperties}>
          <p className="eyebrow">Software</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {solutions.slice(0, 6).map((s) => (
              <Link key={s.id} href={`/solutions/${s.slug}`} className="group flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition hover:bg-paper-100">
                <span className="transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <SolutionIcon icon={s.icon} size={52} />
                </span>
                <span className="text-xs font-semibold text-ink-800">{s.name.replace("oneKampus ", "")}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div {...enter(4)} className="enter relative -mt-6 ml-8 sm:ml-16">
        <div className="float card p-5 shadow-2xl shadow-ink-950/10" style={{ "--rot": "-1deg", "--d": "1.2s" } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <p className="eyebrow">Kampus Store</p>
            <Link href="/store" className="text-xs font-semibold text-coral-600 hover:underline">Shop all →</Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {photos.map((p) => (
              <Link key={p.id} href={`/store/${p.slug}`} className="group overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(p.image!, 300)} alt={p.name} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-110" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
