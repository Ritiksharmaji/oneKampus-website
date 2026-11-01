"use client";

import { ContactFields, Field, FormError, SubmitButton, SuccessPanel, TextArea, useLeadForm } from "@/components/lead-form";

export function PartnerForm() {
  const { status, fieldErrors, submit, attempt } = useLeadForm("PARTNER");

  if (status.kind === "done") return <SuccessPanel title="Thanks for your interest" refNo={status.ref} />;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}
      className="card relative space-y-4 p-6 sm:p-8"
      noValidate
    >
      <ContactFields errors={fieldErrors} />
      <Field name="city" label="City / region" required error={fieldErrors.city} />
      <TextArea name="message" label="About your business" rows={4} placeholder="What you do today, how many schools you work with…" error={fieldErrors.message} />
      <FormError message={status.kind === "error" ? status.message : undefined} />
      <SubmitButton sending={status.kind === "sending"} attempt={attempt}>Apply to partner</SubmitButton>
    </form>
  );
}
