import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SavedNotice({ saved }: { saved?: string | string[] }) {
  if (!saved) return null;
  return (
    <p role="status" className="mb-4 rounded-xl bg-mint-100 px-4 py-3 text-sm font-medium text-mint-700">
      Saved. The website is updated.
    </p>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-ink-950">
      <ArrowLeft className="size-4" /> {label}
    </Link>
  );
}

/** Simple table of rows linking to their edit pages. */
export function AdminTable({
  columns, rows, empty = "Nothing here yet.",
}: {
  columns: string[];
  rows: { href: string; cells: React.ReactNode[] }[];
  empty?: string;
}) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="border-b border-ink-100 text-left text-ink-500">
          <tr>{columns.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => (
            <tr key={r.href} className="hover:bg-paper-50">
              {r.cells.map((cell, i) => (
                <td key={i} className="px-4 py-3">
                  {i === 0 ? <Link href={r.href} className="font-semibold text-ink-950 hover:text-coral-600">{cell}</Link> : cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-ink-500">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
