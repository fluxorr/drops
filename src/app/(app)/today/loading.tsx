export default function Loading() {
  return (
    <section aria-label="Loading today&apos;s plan" className="animate-fade-up">
      <svg viewBox="0 0 140 36" className="w-36 h-9 mb-6" fill="none" aria-hidden="true">
        <rect x="0" y="6" width="50" height="5" rx="2" className="fill-rule animate-shimmer" />
        <rect x="0" y="20" width="100" height="8" rx="3" className="fill-rule animate-shimmer" style={{ animationDelay: "0.15s" }} />
      </svg>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-rule p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 size-4 shrink-0 rounded border border-rule animate-shimmer" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-3/4 rounded animate-shimmer" />
                <div className="mt-2 h-3 w-1/2 rounded animate-shimmer" />
              </div>
              <div className="h-6 w-14 shrink-0 rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
