// Shapes of the JSON columns in prisma/schema.prisma.

export type Feature = { title: string; description: string };
export type Faq = { q: string; a: string };
export type Spec = { label: string; value: string };
export type ProductOption = { name: string; values: string[] };
export type PriceTier = { minQty: number; price: number };

export type QuoteItem = {
  productId: string;
  slug: string;
  name: string;
  qty: number;
  unit: string;
  options: Record<string, string>;
  customization?: string;
};

export type Stat = { value: string; label: string };

export type SiteSettings = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  heroTitle: string;
  heroSubtitle: string;
  stats: Stat[];
  social: { label: string; url: string }[];
};
