"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useQuoteBasket } from "@/components/quote-basket";
import { ContactFields, Field, FormError, SubmitButton, SuccessPanel, TextArea, useLeadForm } from "@/components/lead-form";
import { buttonClass } from "@/components/ui";

export function QuoteView() {
  const { items, ready, update, remove, clear } = useQuoteBasket();
  const { status, fieldErrors, submit } = useLeadForm("QUOTE");

  if (status.kind === "done") {
    return <div className="mx-auto max-w-2xl"><SuccessPanel title="Quote request sent" refNo={status.ref} /></div>;
  }

  if (!ready) return <div className="card h-48 animate-pulse bg-paper-100" />;

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <ShoppingBag className="mx-auto size-12 text-ink-300" />
        <h2 className="mt-4 text-xl font-semibold">Your quote basket is empty</h2>
        <p className="mt-2 text-ink-600">Browse the Kampus Store and add the items you need with quantities.</p>
        <Link href="/store" className={`${buttonClass("primary")} mt-6`}>Browse the store</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ref = await submit(e.currentTarget, { items });
    if (ref) clear();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
      <div className="card divide-y divide-ink-100">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">{items.length} item{items.length > 1 && "s"}</h2>
          <Link href="/store" className="text-sm font-semibold text-coral-600 hover:underline">+ Add more</Link>
        </div>
        {items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Link href={`/store/${item.slug}`} className="font-semibold text-ink-950 hover:text-coral-600">{item.name}</Link>
              <p className="text-sm text-ink-500">
                {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ") || "Standard"}
              </p>
              {item.customization && <p className="mt-1 text-sm text-ink-600">Custom: {item.customization}</p>}
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`qty-${i}`}>Quantity for {item.name}</label>
              <input
                id={`qty-${i}`}
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => update(i, { qty: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                className="input w-28 text-right"
              />
              <span className="w-20 text-sm text-ink-500">{item.unit}s</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-9 place-items-center rounded-full text-ink-400 hover:bg-coral-50 hover:text-coral-600"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="card relative space-y-4 p-6" noValidate>
        <h2 className="text-lg font-semibold">Your details</h2>
        <ContactFields errors={fieldErrors} institutionRequired />
        <Field name="city" label="Delivery city" autoComplete="address-level2" error={fieldErrors.city} />
        <TextArea name="message" label="Anything else?" rows={3} placeholder="Delivery date, sample request, design files…" error={fieldErrors.message} />
        <FormError message={status.kind === "error" ? (fieldErrors.items ?? status.message) : undefined} />
        <SubmitButton sending={status.kind === "sending"}>Send quote request</SubmitButton>
        <p className="text-xs text-ink-500">
          By sending this request you agree to our <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      </form>
    </div>
  );
}
