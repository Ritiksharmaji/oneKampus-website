"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { useQuoteBasket } from "@/components/quote-basket";
import type { ProductOption } from "@/lib/types";

type Props = {
  product: {
    id: string; slug: string; name: string; unit: string; moq: number;
    options: ProductOption[]; customizable: boolean; customizationNote: string | null;
  };
};

export function AddToQuote({ product }: Props) {
  const { add } = useQuoteBasket();
  const [qty, setQty] = useState(product.moq);
  const [options, setOptions] = useState<Record<string, string>>(
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0] ?? ""])),
  );
  const [customization, setCustomization] = useState("");
  const [added, setAdded] = useState(false);

  const step = product.moq >= 100 ? 50 : 10;
  const tooFew = qty < product.moq;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooFew) return;
    add({
      productId: product.id, slug: product.slug, name: product.name, qty, unit: product.unit,
      options, customization: customization.trim() || undefined,
    });
    setAdded(true);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {product.options.map((o) => (
        <div key={o.name}>
          <span className="label">{o.name}</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={o.name}>
            {o.values.map((v) => {
              const selected = options[o.name] === v;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => { setOptions((prev) => ({ ...prev, [o.name]: v })); setAdded(false); }}
                  className={`min-w-11 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    selected ? "border-coral-500 bg-coral-50 text-coral-700" : "border-ink-200 text-ink-700 hover:border-ink-300"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <label htmlFor="qty" className="label">Quantity ({product.unit}s)</label>
        <div className="flex items-center gap-2">
          <button type="button" className={buttonClass("outline", "sm")} aria-label="Decrease quantity"
            onClick={() => { setQty((q) => Math.max(product.moq, q - step)); setAdded(false); }}>
            <Minus className="size-4" />
          </button>
          <input
            id="qty"
            type="number"
            inputMode="numeric"
            min={product.moq}
            value={qty}
            onChange={(e) => { setQty(Math.max(0, Math.floor(Number(e.target.value) || 0))); setAdded(false); }}
            className="input w-32 text-center"
          />
          <button type="button" className={buttonClass("outline", "sm")} aria-label="Increase quantity"
            onClick={() => { setQty((q) => q + step); setAdded(false); }}>
            <Plus className="size-4" />
          </button>
        </div>
        <p className={`mt-1.5 text-xs ${tooFew ? "text-coral-700" : "text-ink-500"}`}>
          Minimum order {product.moq.toLocaleString("en-IN")} {product.unit}s.
        </p>
      </div>

      {product.customizable && (
        <div>
          <label htmlFor="custom" className="label">Customisation <span className="font-normal text-ink-500">(optional)</span></label>
          <textarea
            id="custom"
            rows={2}
            value={customization}
            onChange={(e) => { setCustomization(e.target.value); setAdded(false); }}
            placeholder={product.customizationNote ?? "Logo, colours, text to print…"}
            className="input"
          />
        </div>
      )}

      {added ? (
        <div className="flex flex-col gap-3 rounded-xl bg-mint-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-mint-700">
            <CheckCircle2 className="size-5" /> Added to your quote basket
          </p>
          <div className="flex gap-2">
            <Link href="/store" className={buttonClass("outline", "sm")}>Keep browsing</Link>
            <Link href="/quote" className={buttonClass("primary", "sm")}>View basket</Link>
          </div>
        </div>
      ) : (
        <button type="submit" disabled={tooFew} className={`${buttonClass("primary", "lg")} w-full`}>
          Add to quote basket
        </button>
      )}
    </form>
  );
}
