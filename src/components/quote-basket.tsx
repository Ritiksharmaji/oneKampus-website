"use client";

// Quote basket kept in the browser (localStorage) until the visitor submits a quote request.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { QuoteItem } from "@/lib/types";

const KEY = "onekampus.quote.v1";

type Basket = {
  items: QuoteItem[];
  ready: boolean;
  add: (item: QuoteItem) => void;
  update: (index: number, patch: Partial<QuoteItem>) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const BasketContext = createContext<Basket | null>(null);

const sameLine = (a: QuoteItem, b: QuoteItem) =>
  a.productId === b.productId &&
  JSON.stringify(a.options) === JSON.stringify(b.options) &&
  (a.customization ?? "") === (b.customization ?? "");

export function QuoteBasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: QuoteItem) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => sameLine(p, item));
      if (i === -1) return [...prev, item];
      return prev.map((p, j) => (j === i ? { ...p, qty: p.qty + item.qty } : p));
    });
  }, []);
  const update = useCallback((index: number, patch: Partial<QuoteItem>) => {
    setItems((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }, []);
  const remove = useCallback((index: number) => setItems((prev) => prev.filter((_, i) => i !== index)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, ready, add, update, remove, clear }), [items, ready, add, update, remove, clear]);
  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useQuoteBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useQuoteBasket must be used inside QuoteBasketProvider");
  return ctx;
}
