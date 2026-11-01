import { ButtonLink } from "@/components/ui";

export function CtaBand({
  title = "Let's set up your campus",
  text = "Tell us about your institute. We'll show you the software and send a quote for everything else.",
}: { title?: string; text?: string }) {
  return (
    <section className="container-x mt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-coral-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-coral-500/15 blur-3xl" />
        <h2 className="relative text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-ink-300">{text}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/book-demo" size="lg">Book a free demo</ButtonLink>
          <ButtonLink href="/store" size="lg" variant="outline">Browse Kampus Store</ButtonLink>
        </div>
      </div>
    </section>
  );
}
