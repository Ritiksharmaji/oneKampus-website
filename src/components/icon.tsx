import {
  Backpack, BookOpen, Box, DatabaseZap, Globe, Headset, IdCard, MonitorSmartphone,
  NotebookPen, PartyPopper, PenLine, Printer, Shirt, type LucideIcon,
} from "lucide-react";

// Icons that admins can pick by name for categories, services and solutions.
export const ICONS: Record<string, LucideIcon> = {
  Backpack, BookOpen, Box, DatabaseZap, Globe, Headset, IdCard, MonitorSmartphone,
  NotebookPen, PartyPopper, PenLine, Printer, Shirt,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Box;
  return <Cmp className={className} aria-hidden />;
}

/** A solution icon is either a brand SVG path ("/brand/...svg") or a lucide icon name. */
export function SolutionIcon({ icon, size = 48 }: { icon: string; size?: number }) {
  if (icon.startsWith("/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" width={size} height={size} className="rounded-[22%]" />;
  }
  return (
    <span
      className="inline-grid place-items-center rounded-[22%] bg-ink-950 text-coral-500"
      style={{ width: size, height: size }}
    >
      <Icon name={icon} className="size-1/2" />
    </span>
  );
}
