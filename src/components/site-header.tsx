"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import clsx from "clsx";
import { mainNav } from "@/lib/site";
import { buttonClass } from "@/components/ui";
import { useQuoteBasket } from "@/components/quote-basket";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const { items, ready } = useQuoteBasket();
  const count = ready ? items.length : 0;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 border-b backdrop-blur transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "border-ink-100 bg-paper-50/90 shadow-[0_8px_30px_-12px_rgba(14,16,36,0.15)]" : "border-transparent bg-paper-50/60",
      )}
    >
      <div className="container-x flex h-16 items-center gap-6">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                isActive(item.href) ? "bg-ink-950 text-white" : "text-ink-700 hover:bg-ink-50 hover:text-ink-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/quote"
            className="relative inline-grid size-10 place-items-center rounded-full text-ink-800 hover:bg-ink-50"
            aria-label={`Quote basket, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <span className="hidden sm:block">
            <Link href="/book-demo" className={buttonClass("primary", "sm")}>Book a demo</Link>
          </span>
          <button
            type="button"
            className="inline-grid size-10 place-items-center rounded-full text-ink-800 hover:bg-ink-50 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink-100 bg-paper-50 lg:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-3">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-xl px-3 py-3 text-base font-medium",
                  isActive(item.href) ? "bg-coral-50 text-coral-700" : "text-ink-800",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/book-demo" onClick={() => setOpen(false)} className={clsx(buttonClass("primary"), "mt-2")}>
              Book a demo
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
