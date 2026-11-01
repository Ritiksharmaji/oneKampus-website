import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/logo";
import { logout } from "@/app/admin/actions/auth";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · oneKampus" }, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-paper-100" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-paper-100 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-ink-100 bg-paper-0 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center px-5"><Logo /></div>
        <AdminNav role={user.role} siteHref={process.env.ADMIN_HOST ? siteUrl : "/"} />
        <div className="hidden border-t border-ink-100 p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
          <p className="truncate text-xs text-ink-500">{user.email} · {user.role.toLowerCase()}</p>
          <form action={logout} className="mt-3">
            <button className="text-sm font-semibold text-coral-600 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-end gap-4 border-b border-ink-100 bg-paper-0 px-4 py-2 text-sm lg:hidden">
          <span className="truncate text-ink-600">{user.name}</span>
          <form action={logout}><button className="font-semibold text-coral-600">Sign out</button></form>
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
