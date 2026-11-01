"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { buttonClass } from "@/components/ui";

export type FormState = { error?: string; ok?: string } | undefined;
type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * A form bound to a server action that shows its error/success message.
 * Change `resetKey` when the saved data changes so the fields remount with the stored values
 * (React resets forms after an action) while the message stays.
 */
export function ActionForm({
  action, children, className, encType, resetKey,
}: { action: Action; children: React.ReactNode; className?: string; encType?: "multipart/form-data"; resetKey?: string | number }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form key={resetKey} action={formAction} className={className} encType={encType}>
      {state?.error && (
        <p role="alert" className="mb-4 rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{state.error}</p>
      )}
      {state?.ok && (
        <p role="status" className="mb-4 rounded-xl bg-mint-100 px-4 py-3 text-sm font-medium text-mint-700">{state.ok}</p>
      )}
      {children}
    </form>
  );
}

export function Submit({
  children, variant = "primary", className,
}: { children: React.ReactNode; variant?: "primary" | "dark" | "outline" | "ghost"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={clsx(buttonClass(variant, "md"), className)}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

/** Submit button that asks for confirmation first (for deletes). */
export function ConfirmSubmit({ children, message }: { children: React.ReactNode; message: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
      className="text-sm font-semibold text-coral-700 hover:underline disabled:opacity-50"
    >
      {children}
    </button>
  );
}
