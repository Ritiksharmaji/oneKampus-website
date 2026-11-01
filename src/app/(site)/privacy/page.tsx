import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Privacy policy" />
      <article className="container-x mt-12 max-w-3xl space-y-6 text-ink-700 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold">
        <p>
          This policy explains what {settings.companyName} collects when you use this website and how we use it.
        </p>
        <h2>What we collect</h2>
        <p>
          When you send a quote request, book a demo or contact us, we store the details you enter — your name,
          institution, email, phone number, city and message — along with the items in your quote basket and the
          page you came from.
        </p>
        <h2>How we use it</h2>
        <p>
          Only to reply to your request, prepare quotations and demos, and follow up about them. We do not sell or
          share your details with third parties for marketing.
        </p>
        <h2>Your quote basket</h2>
        <p>
          The items you add to the quote basket are kept in your own browser until you submit the request.
        </p>
        <h2>Your choices</h2>
        <p>
          To see, correct or delete the details we hold about you, write to{" "}
          <a href={`mailto:${settings.email}`} className="font-semibold text-coral-600">{settings.email}</a>.
        </p>
      </article>
    </>
  );
}
