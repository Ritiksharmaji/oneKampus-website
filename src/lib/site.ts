import type { PriceTier } from "@/lib/types";

export const siteUrl = process.env.SITE_URL || "http://localhost:3300";
/** Where the admin panel lives: its own subdomain in production (ADMIN_HOST), otherwise the site itself. */
export const adminUrl = process.env.ADMIN_HOST ? `https://${process.env.ADMIN_HOST}` : siteUrl;

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

/** Cloudinary photos are resized and served as WebP/AVIF automatically; other URLs are returned as is. */
export function imageSrc(url: string, width = 1200) {
  return url.includes("res.cloudinary.com/") ? url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`) : url;
}
