"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { LEAD_STATUSES } from "@/components/admin/bits";
import type { FormState } from "@/components/admin/action-form";

export async function updateLead(_: FormState, formData: FormData): Promise<FormState> {
  await requireUser(can.leads);
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as LeadStatus;
  const assignedToId = String(formData.get("assignedToId") ?? "") || null;
  if (!LEAD_STATUSES.includes(status)) return { error: "Unknown status." };

  await db.lead.update({ where: { id }, data: { status, assignedToId } });
  revalidatePath(`/admin/leads/${id}`);
  return { ok: "Lead updated." };
}

export async function addLeadNote(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(can.leads);
  const id = String(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 4000) return { error: "Notes can be up to 4000 characters." };

  await db.leadNote.create({ data: { leadId: id, authorId: user.id, body } });
  revalidatePath(`/admin/leads/${id}`);
  return { ok: "Note added." };
}

export async function deleteLead(formData: FormData) {
  await requireUser(can.deleteLeads);
  await db.lead.delete({ where: { id: String(formData.get("id")) } });
  redirect("/admin/leads");
}
