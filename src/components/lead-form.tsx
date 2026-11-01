"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";
import { buttonClass } from "@/components/ui";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; ref: string };

/** Posts a lead to /api/leads and tracks field errors, sending state and the returned reference. */
export function useLeadForm(type: "QUOTE" | "DEMO" | "CONTACT" | "PARTNER") {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(form: HTMLFormElement, extra: Record<string, unknown> = {}) {
    const values = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
    );
    const params = new URLSearchParams(window.location.search);
    const source: Record<string, string> = { page: window.location.pathname };
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = params.get(key);
      if (v) source[key] = v;
    }

    setStatus({ kind: "sending" });
    setFieldErrors({});
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...extra, type, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
        return null;
      }
      setStatus({ kind: "done", ref: data.ref });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return data.ref as string;
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
      return null;
    }
  }

  return { status, fieldErrors, submit };
}

export function Field({
  name, label, error, required, type = "text", placeholder, defaultValue, autoComplete, className,
}: {
  name: string; label: string; error?: string; required?: boolean; type?: string;
  placeholder?: string; defaultValue?: string; autoComplete?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label} {!required && <span className="font-normal text-ink-400">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={clsx("input", error && "border-coral-500")}
      />
      {error && <p id={`${name}-error`} className="mt-1 text-xs text-coral-700">{error}</p>}
    </div>
  );
}

export function TextArea({
  name, label, error, required, placeholder, rows = 4, defaultValue,
}: { name: string; label: string; error?: string; required?: boolean; placeholder?: string; rows?: number; defaultValue?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {!required && <span className="font-normal text-ink-400">(optional)</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        className={clsx("input", error && "border-coral-500")}
      />
      {error && <p className="mt-1 text-xs text-coral-700">{error}</p>}
    </div>
  );
}

/** Contact fields every lead form shares, plus the hidden honeypot. */
export function ContactFields({ errors, institutionRequired }: { errors: Record<string, string>; institutionRequired?: boolean }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Your name" required autoComplete="name" error={errors.name} />
        <Field name="institution" label="Institution" required={institutionRequired} autoComplete="organization" error={errors.institution} />
        <Field name="email" label="Email" type="email" required autoComplete="email" error={errors.email} />
        <Field name="phone" label="Phone" type="tel" required autoComplete="tel" placeholder="+91" error={errors.phone} />
      </div>
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
    </>
  );
}

export function SubmitButton({ sending, children }: { sending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={sending} className={clsx(buttonClass("primary", "lg"), "w-full sm:w-auto")}>
      {sending && <Loader2 className="size-4 animate-spin" />}
      {sending ? "Sending…" : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{message}</p>;
}

export function SuccessPanel({ title, refNo, children }: { title: string; refNo: string; children?: React.ReactNode }) {
  return (
    <div className="card p-8 text-center" role="status">
      <CheckCircle2 className="mx-auto size-14 text-mint-500" />
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-ink-600">
        Your reference number is <strong className="font-mono text-ink-950">{refNo}</strong>. We&apos;ve emailed you a copy
        and our team will get back to you within one working day.
      </p>
      {children}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("outline")}>Back to home</Link>
        <Link href="/store" className={buttonClass("ghost")}>Browse the store</Link>
      </div>
    </div>
  );
}
