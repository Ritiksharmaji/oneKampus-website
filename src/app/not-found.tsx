import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <Link href="/"><Logo /></Link>
        <p className="mt-10 font-display text-7xl font-bold text-coral-500">404</p>
        <h1 className="mt-4 text-2xl font-semibold">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-ink-600">It may have moved, or the link may be mistyped.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonClass("primary")}>Go home</Link>
          <Link href="/store" className={buttonClass("outline")}>Browse the store</Link>
        </div>
      </div>
    </main>
  );
}
