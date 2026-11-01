import type { Metadata } from "next";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { ACheck, AdminHeader, AField, ASelect } from "@/components/admin/bits";
import { createUser, updateUser } from "@/app/admin/actions/users";

// Signed-in page: navigation waits for the auth check (loading.tsx shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Users" };

const roleOptions = [
  { value: "SALES", label: "Sales — leads only" },
  { value: "EDITOR", label: "Editor — website content" },
  { value: "ADMIN", label: "Admin — everything" },
];

export default async function UsersPage() {
  const me = await requireUser(can.users);
  const users = await db.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <>
      <AdminHeader title="Users" intro="People who can sign in to this admin panel." />

      <div className="space-y-3">
        {users.map((u) => (
          <ActionForm key={u.id} resetKey={`${u.role}-${u.active}`} action={updateUser} className="card p-5">
            <input type="hidden" name="id" value={u.id} />
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_auto_auto] lg:items-end">
              <div>
                <p className="font-semibold text-ink-950">{u.name}{u.id === me.id && <span className="font-normal text-ink-500"> (you)</span>}</p>
                <p className="text-sm text-ink-500">{u.email}</p>
              </div>
              <ASelect label="Role" name="role" defaultValue={u.role} options={roleOptions} />
              <AField label="New password" name="password" type="password" placeholder="Leave empty to keep" />
              <div className="pb-2.5"><ACheck label="Active" name="active" defaultChecked={u.active} /></div>
              <Submit variant="outline">Save</Submit>
            </div>
          </ActionForm>
        ))}
      </div>

      <ActionForm action={createUser} className="card mt-8 space-y-4 p-6">
        <h2 className="font-semibold">Add a user</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AField label="Name" name="name" required />
          <AField label="Email" name="email" type="email" required />
          <ASelect label="Role" name="role" defaultValue="SALES" options={roleOptions} />
          <AField label="Password" name="password" type="password" required hint="At least 10 characters. Share it privately." />
        </div>
        <Submit>Add user</Submit>
      </ActionForm>
    </>
  );
}
