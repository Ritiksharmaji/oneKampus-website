import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getCategories, getSettings, getSolutions } from "@/lib/content";
import { Logo } from "@/components/logo";

export async function SiteFooter() {
  const [settings, solutions, categories] = await Promise.all([getSettings(), getSolutions(), getCategories()]);

  return (
    <footer className="mt-24 bg-ink-950 text-ink-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
            Software and supplies for schools, colleges and coaching institutes — from admissions to annual day.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex gap-2.5"><Mail className="size-4 shrink-0 text-coral-400" /><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>
            <li className="flex gap-2.5"><Phone className="size-4 shrink-0 text-coral-400" /><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">{settings.phone}</a></li>
            <li className="flex gap-2.5"><MapPin className="size-4 shrink-0 text-coral-400" />{settings.address}</li>
          </ul>
        </div>

        <FooterColumn title="Software" links={solutions.map((s) => ({ href: `/solutions/${s.slug}`, label: s.name }))} />
        <FooterColumn
          title="Kampus Store"
          links={categories.map((c) => ({ href: `/store/category/${c.slug}`, label: c.name }))}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/services", label: "Services" },
            { href: "/about", label: "About us" },
            { href: "/partners", label: "Become a partner" },
            { href: "/contact", label: "Contact" },
            { href: "/book-demo", label: "Book a demo" },
            { href: "/privacy", label: "Privacy policy" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:justify-between">
          <p>© {settings.companyName}. All rights reserved.</p>
          <p>{settings.hours}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-white">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
