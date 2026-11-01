import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-coral-50 to-paper-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center"><Logo /></div>
        <div className="card mt-8 p-7 shadow-xl shadow-ink-950/5">
          <h1 className="text-xl font-semibold">Sign in to admin</h1>
          <p className="mt-1 text-sm text-ink-600">Manage website content and leads.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
