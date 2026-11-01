import type { PriceTier } from "@/lib/types";

export const siteUrl = process.env.SITE_URL ?? "http://localhost:3300";

export const mainNav = [
  { href: "/solutions", label: "Software" },
  { href: "/store", label: "Kampus Store" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Lowest indicative unit price, for "from ₹x" labels. */
export function startingPrice(tiers: PriceTier[]) {
  return tiers.length ? Math.min(...tiers.map((t) => t.price)) : null;
}
