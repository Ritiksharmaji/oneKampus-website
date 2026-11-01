"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { bool, str } from "@/lib/form-data";
import type { FormState } from "@/components/admin/action-form";

const ROLES: Role[] = ["ADMIN", "EDITOR", "SALES"];

export async function createUser(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(can.users);
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const role = str(fd, "role") as Role;
  const password = String(fd.get("password") ?? "");

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (!ROLES.includes(role)) return { error: "Pick a role." };
  if (password.length < 10) return { error: "Passwords need at least 10 characters." };
  if (await db.user.findUnique({ where: { email } })) return { error: "A user with this email already exists." };

  await db.user.create({ data: { name, email, role, passwordHash: await bcrypt.hash(password, 10) } });
  revalidatePath("/admin/users");
  return { ok: `${name} can now sign in with ${email}.` };
}

export async function updateUser(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser(can.users);
  const id = str(fd, "id");
  const role = str(fd, "role") as Role;
  const active = bool(fd, "active");
  const password = String(fd.get("password") ?? "");

  if (!ROLES.includes(role)) return { error: "Pick a role." };
  if (id === me.id && (role !== "ADMIN" || !active)) return { error: "You can't remove your own admin access." };
  if (password && password.length < 10) return { error: "Passwords need at least 10 characters." };

  await db.user.update({
    where: { id },
    data: { role, active, ...(password && { passwordHash: await bcrypt.hash(password, 10) }) },
  });
  revalidatePath("/admin/users");
  return { ok: password ? "User updated and password changed." : "User updated." };
}
