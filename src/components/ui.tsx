import Link from "next/link";
import clsx from "clsx";
import { reveal } from "@/lib/motion";

type Variant = "primary" | "dark" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 shadow-sm shadow-coral-500/20",
  dark: "bg-ink-950 text-white hover:bg-ink-800",
  outline: "border border-ink-200 bg-paper-0 text-ink-900 hover:border-ink-300 hover:bg-paper-100",
  ghost: "text-ink-700 hover:bg-ink-50 hover:text-ink-950",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "lg" | "sm" = "md") {
  return clsx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    size === "lg" && "px-6 py-3 text-base",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "sm" && "px-3.5 py-1.5 text-sm",
    variants[variant],
  );
}

export function ButtonLink({
  href, children, variant = "primary", size = "md", className,
}: { href: string; children: React.ReactNode; variant?: Variant; size?: "md" | "lg" | "sm"; className?: string }) {
  return (
    <Link href={href} className={clsx(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

export function SectionHeading({
  eyebrow, title, intro, center,
}: { eyebrow?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div {...reveal()} className={clsx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg text-ink-600">{intro}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro, children }: {
  eyebrow?: string; title: string; intro?: string; children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-ink-100 bg-gradient-to-b from-coral-50/70 to-paper-50">
      <div className="container-x py-14 sm:py-20">
        {eyebrow && <p className="eyebrow enter">{eyebrow}</p>}
        <h1 className="enter mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl" style={{ "--d": "80ms" } as React.CSSProperties}>{title}</h1>
        {intro && <p className="enter mt-5 max-w-2xl text-lg text-ink-600" style={{ "--d": "160ms" } as React.CSSProperties}>{intro}</p>}
        {children && <div className="enter" style={{ "--d": "240ms" } as React.CSSProperties}>{children}</div>}
      </div>
    </section>
  );
}

export function Badge({ children, tone = "coral" }: { children: React.ReactNode; tone?: "coral" | "ink" | "mint" | "amber" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "coral" && "bg-coral-100 text-coral-700",
        tone === "ink" && "bg-ink-100 text-ink-700",
        tone === "mint" && "bg-mint-100 text-mint-700",
        tone === "amber" && "bg-amber-100 text-amber-700",
      )}
    >
      {children}
    </span>
  );
}
