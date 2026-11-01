"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes, ExternalLink, FolderTree, Inbox, LayoutDashboard, Laptop, MessageSquareQuote, Settings, Users, Wrench,
} from "lucide-react";
import clsx from "clsx";
import type { Role } from "@prisma/client";

const items: { href: string; label: string; icon: typeof Inbox; roles: Role[] }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "EDITOR", "SALES"] },
  { href: "/admin/leads", label: "Leads", icon: Inbox, roles: ["ADMIN", "SALES"] },
  { href: "/admin/solutions", label: "Software", icon: Laptop, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/products", label: "Products", icon: Boxes, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/services", label: "Services", icon: Wrench, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/settings", label: "Site settings", icon: Settings, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["ADMIN"] },
];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Admin">
      {items.filter((i) => i.roles.includes(role)).map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
              active ? "bg-coral-50 text-coral-700" : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <item.icon className="size-4" /> {item.label}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50">
        <ExternalLink className="size-4" /> View website
      </Link>
    </nav>
  );
}
