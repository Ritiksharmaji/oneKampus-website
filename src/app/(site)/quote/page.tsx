import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { QuoteView } from "./quote-view";

export const metadata: Metadata = {
  title: "Your quote basket",
  description: "Review the items in your quote basket and send a quote request to oneKampus.",
  robots: { index: false },
};

export default function QuotePage() {
  return (
    <>
      <PageHeader
        eyebrow="Quote basket"
        title="Request a quotation"
        intro="Check quantities and options, add your details, and we'll send a quotation within one working day. No payment now."
      />
      <section className="container-x mt-10">
        <QuoteView />
      </section>
    </>
  );
}
