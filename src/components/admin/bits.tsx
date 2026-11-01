import Link from "next/link";
import type { LeadStatus, LeadType } from "@prisma/client";
import { Badge, buttonClass } from "@/components/ui";

export function AdminHeader({
  title, intro, action,
}: { title: string; intro?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {intro && <p className="mt-1 text-sm text-ink-600">{intro}</p>}
      </div>
      {action && <Link href={action.href} className={buttonClass("primary")}>{action.label}</Link>}
    </div>
  );
}

const statusTone: Record<LeadStatus, "coral" | "ink" | "mint" | "amber"> = {
  NEW: "coral", CONTACTED: "amber", QUOTED: "amber", WON: "mint", LOST: "ink", CLOSED: "ink",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={statusTone[status]}>{status.toLowerCase()}</Badge>;
}

export const TYPE_LABEL: Record<LeadType, string> = {
  QUOTE: "Quote", DEMO: "Demo", CONTACT: "Contact", PARTNER: "Partner",
};

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST", "CLOSED"];
export const LEAD_TYPES: LeadType[] = ["QUOTE", "DEMO", "CONTACT", "PARTNER"];

export function formatDate(d: Date) {
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function Published({ value }: { value: boolean }) {
  return value ? <Badge tone="mint">published</Badge> : <Badge tone="ink">hidden</Badge>;
}

/** Labelled form controls for admin edit pages. */
export function AField({
  label, name, defaultValue, required, type = "text", hint, placeholder,
}: { label: string; name: string; defaultValue?: string | number | null; required?: boolean; type?: string; hint?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder}
        defaultValue={defaultValue ?? ""} step={type === "number" ? "any" : undefined} className="input" />
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function AText({
  label, name, defaultValue, rows = 4, hint, required, mono,
}: { label: string; name: string; defaultValue?: string | null; rows?: number; hint?: string; required?: boolean; mono?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <textarea id={name} name={name} rows={rows} required={required} defaultValue={defaultValue ?? ""}
        className={`input ${mono ? "font-mono text-[13px]" : ""}`} />
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function ACheck({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-800">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-coral-500" />
      {label}
    </label>
  );
}

export function ASelect({
  label, name, defaultValue, options,
}: { label: string; name: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="input">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
