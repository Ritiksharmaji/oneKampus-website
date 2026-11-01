import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Solution } from "@prisma/client";
import { Icon, SolutionIcon } from "@/components/icon";
import { Badge } from "@/components/ui";
import { formatINR, startingPrice } from "@/lib/site";
import type { StoreProduct } from "@/lib/content";

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      className="card group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-coral-200 hover:shadow-xl hover:shadow-ink-950/5"
    >
      <span className="inline-block transition duration-300 group-hover:scale-105"><SolutionIcon icon={solution.icon} size={52} /></span>
      <h3 className="mt-5 text-xl font-semibold">{solution.name}</h3>
      <p className="mt-1.5 text-ink-600">{solution.tagline}</p>
      <ul className="mt-5 space-y-2 text-sm text-ink-700">
        {solution.highlights.map((h) => (
          <li key={h} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-mint-500" />
            {h}
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-coral-600">
        Explore {solution.name.replace("oneKampus ", "")}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

const tileTones = ["bg-coral-50 text-coral-600", "bg-mint-100 text-mint-700", "bg-amber-100 text-amber-700", "bg-ink-100 text-ink-700"];

/** Product photo, or a branded tile with the category icon when no photo was uploaded yet. */
export function ProductVisual({ product, className = "" }: { product: StoreProduct; className?: string }) {
  if (product.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image} alt={product.name} loading="lazy" className={`aspect-[4/3] w-full object-cover ${className}`} />;
  }
  const tone = tileTones[product.category.order % tileTones.length];
  return (
    <div className={`grid aspect-[4/3] w-full place-items-center ${tone} ${className}`}>
      <Icon name={product.category.icon} className="size-16 opacity-80" />
    </div>
  );
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const from = startingPrice(product.priceTiers);
  return (
    <Link
      href={`/store/${product.slug}`}
      className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-coral-200 hover:shadow-xl hover:shadow-ink-950/5"
    >
      <div className="overflow-hidden">
        <ProductVisual product={product} className="transition duration-700 ease-out group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-ink-500">{product.category.name}</p>
        <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{product.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {from !== null && (
            <span className="text-sm text-ink-700">
              from <strong className="text-ink-950">{formatINR(from)}</strong>/{product.unit}
            </span>
          )}
          {product.customizable && <Badge tone="mint">Custom print</Badge>}
        </div>
      </div>
    </Link>
  );
}
