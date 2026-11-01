"use client";

import { useSearchParams } from "next/navigation";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { login } from "@/app/admin/actions/auth";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  return (
    <ActionForm action={login} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <Submit className="w-full">Sign in</Submit>
    </ActionForm>
  );
}
