import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.uid },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return user?.active ? user : null;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Who can do what in the admin panel. */
export const can = {
  leads: (role: Role) => role === "ADMIN" || role === "SALES",
  content: (role: Role) => role === "ADMIN" || role === "EDITOR",
  users: (role: Role) => role === "ADMIN",
  deleteLeads: (role: Role) => role === "ADMIN",
};

/** Returns the signed-in user, or redirects to login / the dashboard if not allowed. */
export async function requireUser(check?: (role: Role) => boolean) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (check && !check(user.role)) redirect("/admin?denied=1");
  return user;
}

export async function startSession(user: { id: string; role: Role }) {
  (await cookies()).set(SESSION_COOKIE, await signSession({ uid: user.id, role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
