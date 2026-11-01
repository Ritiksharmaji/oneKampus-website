"use client";

import { useSearchParams } from "next/navigation";
import { ContactFields, Field, FormError, SubmitButton, SuccessPanel, TextArea, useLeadForm } from "@/components/lead-form";

const topics = [
  { value: "software", label: "Software" },
  { value: "store", label: "Kampus Store / supplies" },
  { value: "services", label: "Services" },
  { value: "support", label: "Support for an existing account" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const topic = useSearchParams().get("topic") ?? "software";
  const { status, fieldErrors, submit, attempt } = useLeadForm("CONTACT");

  if (status.kind === "done") return <SuccessPanel title="Message sent" refNo={status.ref} />;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const chosen = (form.elements.namedItem("topic") as HTMLSelectElement).value;
    const label = topics.find((t) => t.value === chosen)?.label ?? chosen;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();
    submit(form, { message: message ? `[${label}] ${message}` : "" });
  }

  return (
    <form onSubmit={onSubmit} className="card relative space-y-4 p-6 sm:p-8" noValidate>
      <ContactFields errors={fieldErrors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="topic" className="label">Topic</label>
          <select id="topic" name="topic" defaultValue={topic} className="input">
            {topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <Field name="city" label="City" autoComplete="address-level2" error={fieldErrors.city} />
      </div>
      <TextArea name="message" label="Message" required rows={5} error={fieldErrors.message} />
      <FormError message={status.kind === "error" ? status.message : undefined} />
      <SubmitButton sending={status.kind === "sending"} attempt={attempt}>Send message</SubmitButton>
    </form>
  );
}
