export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/onekampus-icon.svg" alt="" width={34} height={34} className="rounded-[22%]" />
      <span className={`font-display text-lg font-bold tracking-tight ${light ? "text-white" : "text-ink-950"}`}>
        one<span className="text-coral-500">Kampus</span>
      </span>
    </span>
  );
}
