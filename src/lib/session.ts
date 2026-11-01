// Signed session cookie for the admin panel. Used by proxy.ts (edge-safe: jose only) and lib/auth.ts.
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "ok_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = { uid: string; role: Role };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set to a random string of 32+ characters");
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { uid: String(payload.uid), role: payload.role as Role };
  } catch {
    return null;
  }
}
