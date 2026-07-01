export default function Loading() {
  return (
    <section aria-label="Loading history" className="animate-fade-up">
      <svg viewBox="0 0 140 36" className="w-36 h-9 mb-6" fill="none" aria-hidden="true">
        <rect x="0" y="6" width="40" height="5" rx="2" className="fill-rule animate-shimmer" />
        <rect x="0" y="20" width="80" height="8" rx="3" className="fill-rule animate-shimmer" style={{ animationDelay: "0.15s" }} />
      </svg>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-rule p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-20 rounded animate-shimmer" />
              <div className="h-4 w-14 rounded animate-shimmer" />
            </div>
            <div className="h-4 w-3/4 rounded animate-shimmer mb-1.5" />
            <div className="h-3 w-full rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
}
