"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/components/admin/action-form";

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000)) {
    return { error: "Too many sign-in attempts. Try again in 15 minutes." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Wrong email or password." };
  }

  await startSession(user);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
