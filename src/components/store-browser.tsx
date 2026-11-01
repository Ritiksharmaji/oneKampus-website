"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { ProductCard } from "@/components/cards";
import type { StoreProduct } from "@/lib/content";
import { reveal } from "@/lib/motion";

type Category = { slug: string; name: string };

/** Category tabs + instant search over the products already on the page. */
export function StoreBrowser({
  products, categories, activeCategory,
}: { products: StoreProduct[]; categories: Category[]; activeCategory?: string }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.summary, p.category.name].some((s) => s.toLowerCase().includes(q)),
    );
  }, [products, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" aria-label="Store categories">
          <CategoryTab href="/store" active={!activeCategory}>All</CategoryTab>
          {categories.map((c) => (
            <CategoryTab key={c.slug} href={`/store/category/${c.slug}`} active={activeCategory === c.slug}>
              {c.name}
            </CategoryTab>
          ))}
        </nav>
        <label className="relative block lg:w-72">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notebooks, shirts, pens…"
            className="input pl-10"
          />
        </label>
      </div>

      {shown.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p, i) => (
            <div key={p.id} {...reveal(i % 4)}><ProductCard product={p} /></div>
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center">
          <p className="font-semibold text-ink-900">No products match “{query}”.</p>
          <p className="mt-2 text-sm text-ink-600">
            Need something else? <Link href="/contact" className="font-semibold text-coral-600 hover:underline">Ask us</Link> — we source most school supplies on request.
          </p>
        </div>
      )}
    </div>
  );
}

function CategoryTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
        active ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-paper-0 text-ink-700 hover:border-ink-300",
      )}
    >
      {children}
    </Link>
  );
}
