/** Placeholder shown for an instant navigation while a page's data streams in. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="border-b border-ink-100 bg-gradient-to-b from-coral-50/70 to-paper-50">
        <div className="container-x space-y-4 py-16">
          <div className="h-3 w-28 rounded-full bg-coral-100" />
          <div className="h-10 w-2/3 max-w-xl rounded-xl bg-ink-100" />
          <div className="h-5 w-1/2 max-w-md rounded-lg bg-ink-100" />
        </div>
      </div>
      <div className="container-x mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card h-64 bg-paper-100" />
        ))}
      </div>
    </div>
  );
}
