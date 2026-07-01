export default function Loading() {
  return (
    <section aria-label="Loading interests" className="animate-fade-up">
      <svg viewBox="0 0 140 36" className="w-36 h-9 mb-6" fill="none" aria-hidden="true">
        <rect x="0" y="6" width="40" height="5" rx="2" className="fill-rule animate-shimmer" />
        <rect x="0" y="20" width="100" height="8" rx="3" className="fill-rule animate-shimmer" style={{ animationDelay: "0.15s" }} />
      </svg>
      <div className="mt-6 flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-rule p-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-2/5 rounded animate-shimmer" />
              <div className="h-6 w-20 rounded animate-shimmer" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <div className="h-5 w-20 rounded animate-shimmer" />
              <div className="h-5 w-24 rounded animate-shimmer" />
              <div className="h-5 w-16 rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
