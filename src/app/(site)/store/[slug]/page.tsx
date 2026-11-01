import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Info } from "lucide-react";
import { getProduct, getProducts } from "@/lib/content";
import { ProductCard, ProductVisual } from "@/components/cards";
import { AddToQuote } from "@/components/add-to-quote";
import { JsonLd } from "@/components/json-ld";
import { Badge, SectionHeading } from "@/components/ui";
import { formatINR, siteUrl, startingPrice } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/store/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.category.name}`,
    description: p.summary,
    alternates: { canonical: `/store/${p.slug}` },
    openGraph: p.image ? { images: [p.image] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/store/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = (await getProducts(product.category.slug)).filter((p) => p.id !== product.id).slice(0, 4);
  const from = startingPrice(product.priceTiers);
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          category: product.category.name,
          url: `${siteUrl}/store/${product.slug}`,
          brand: { "@type": "Brand", name: "oneKampus" },
          ...(from !== null && {
            offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: from, offerCount: tiers.length },
          }),
        }}
      />

      <div className="container-x pt-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-ink-500" aria-label="Breadcrumb">
          <Link href="/store" className="hover:text-ink-900">Store</Link>
          <ChevronRight className="size-4" />
          <Link href={`/store/category/${product.category.slug}`} className="hover:text-ink-900">{product.category.name}</Link>
          <ChevronRight className="size-4" />
          <span className="text-ink-800">{product.name}</span>
        </nav>
      </div>

      <section className="container-x mt-6 grid gap-10 lg:grid-cols-2">
        <div className="card overflow-hidden lg:sticky lg:top-24 lg:self-start">
          <ProductVisual product={product} />
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="ink">{product.category.name}</Badge>
            {product.customizable && <Badge tone="mint">Custom print available</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-lg text-ink-600">{product.summary}</p>

          {from !== null && (
            <p className="mt-5 text-ink-700">
              from <span className="font-display text-3xl font-bold text-ink-950">{formatINR(from)}</span> / {product.unit}
            </p>
          )}

          <div className="card mt-6 p-5 sm:p-6">
            <AddToQuote
              product={{
                id: product.id, slug: product.slug, name: product.name, unit: product.unit, moq: product.moq,
                options: product.options, customizable: product.customizable, customizationNote: product.customizationNote,
              }}
            />
          </div>

          {tiers.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Bulk pricing</h2>
              <table className="mt-3 w-full overflow-hidden rounded-xl border border-ink-100 bg-paper-0 text-sm">
                <thead className="bg-paper-100 text-left text-ink-600">
                  <tr><th className="px-4 py-2.5 font-medium">Quantity</th><th className="px-4 py-2.5 font-medium">Price per {product.unit}</th></tr>
                </thead>
                <tbody>
                  {tiers.map((t, i) => (
                    <tr key={t.minQty} className="border-t border-ink-100">
                      <td className="px-4 py-2.5">
                        {t.minQty.toLocaleString("en-IN")}
                        {tiers[i + 1] ? ` – ${(tiers[i + 1].minQty - 1).toLocaleString("en-IN")}` : "+"}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-ink-950">{formatINR(t.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 flex gap-1.5 text-xs text-ink-500">
                <Info className="size-3.5 shrink-0" /> Indicative prices before tax. Your final quote depends on quantity, customisation and delivery location.
              </p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold">About this product</h2>
            <p className="mt-2 whitespace-pre-line text-ink-700">{product.description}</p>
          </div>

          {product.specs.length > 0 && (
            <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ink-100 bg-ink-100 text-sm sm:grid-cols-2">
              {product.specs.map((s) => (
                <div key={s.label} className="bg-paper-0 px-4 py-3">
                  <dt className="text-ink-500">{s.label}</dt>
                  <dd className="font-medium text-ink-900">{s.value}</dd>
                </div>
              ))}
              <div className="bg-paper-0 px-4 py-3">
                <dt className="text-ink-500">Minimum order</dt>
                <dd className="font-medium text-ink-900">{product.moq.toLocaleString("en-IN")} {product.unit}s</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading title={`More ${product.category.name.toLowerCase()}`} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
