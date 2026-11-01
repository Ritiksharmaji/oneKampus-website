import { BadgePercent, Palette, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui";

export function StoreHeader({ title, intro }: { title?: string; intro?: string }) {
  return (
    <PageHeader
      eyebrow="Kampus Store"
      title={title ?? "School supplies, made for your institute"}
      intro={intro ?? "Add what you need to your quote basket — with quantities, sizes and printing — and we'll send a quotation within one working day."}
    >
      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-ink-700">
        <li className="flex items-center gap-2"><BadgePercent className="size-5 text-coral-500" /> Institute bulk pricing</li>
        <li className="flex items-center gap-2"><Palette className="size-5 text-coral-500" /> Your logo and colours</li>
        <li className="flex items-center gap-2"><Truck className="size-5 text-coral-500" /> Delivered to your campus</li>
      </ul>
    </PageHeader>
  );
}
