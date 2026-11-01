import { QuoteBasketProvider } from "@/components/quote-basket";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuoteBasketProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </QuoteBasketProvider>
  );
}
