"use client";

import { useSearchParams } from "next/navigation";
import { ContactFields, Field, FormError, SubmitButton, SuccessPanel, TextArea, useLeadForm } from "@/components/lead-form";

export function DemoForm({ solutions }: { solutions: { slug: string; name: string }[] }) {
  const preselected = useSearchParams().get("solution") ?? "";
  const { status, fieldErrors, submit } = useLeadForm("DEMO");

  if (status.kind === "done") return <SuccessPanel title="Demo request received" refNo={status.ref} />;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}
      className="card relative space-y-4 p-6 sm:p-8"
      noValidate
    >
      <ContactFields errors={fieldErrors} institutionRequired />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="solution" className="label">Product</label>
          <select id="solution" name="solution" defaultValue={preselected} className="input">
            <option value="">Not sure yet — show me everything</option>
            {solutions.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
        <Field name="preferredDate" label="Preferred date" type="date" error={fieldErrors.preferredDate} defaultValue="" />
      </div>
      <Field name="city" label="City" autoComplete="address-level2" error={fieldErrors.city} />
      <TextArea name="message" label="What would you like to see?" rows={3} placeholder="Number of students, branches, what you use today…" error={fieldErrors.message} />
      <FormError message={status.kind === "error" ? status.message : undefined} />
      <SubmitButton sending={status.kind === "sending"}>Request my demo</SubmitButton>
    </form>
  );
}
