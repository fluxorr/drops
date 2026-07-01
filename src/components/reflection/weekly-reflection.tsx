import { formatLedgerDate } from "@/lib/dates";
import type { WeeklyReflectionContent } from "@/database/schemas";

export type Reflection = {
  id: string;
  weekStartedAt: Date;
  content: WeeklyReflectionContent;
};

export function WeeklyReflectionCard({ reflection }: { reflection: Reflection }) {
  const { content } = reflection;

  return (
    <article className="mt-8 rounded-xl border border-rule p-5 transition-all duration-150 hover:border-ink/20" aria-labelledby={`reflection-${reflection.id}`}>
      <p className="mb-2 text-xs text-muted">
        Week of {formatLedgerDate(reflection.weekStartedAt)}
      </p>

      <h2 id={`reflection-${reflection.id}`} className="text-lg font-[450] leading-[1.15] tracking-[-0.015em] mt-3 mb-3">
        Weekly Reflection
      </h2>

      {content.narrative && (
        <p className="mb-4 max-w-[52ch] text-base leading-[1.7] text-muted">{content.narrative}</p>
      )}

      <div className="flex gap-6 mb-4">
        <div className="flex flex-col">
          <span className="text-xl font-[450] text-ink">{content.completedLessons}</span>
          <span className="text-sm text-muted">lessons completed</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-[450] text-ink">{content.newConcepts}</span>
          <span className="text-sm text-muted">new concepts</span>
        </div>
      </div>

      {content.topTopics.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-1.5 text-xs text-muted">Top topics</h3>
          <div className="flex flex-wrap gap-1.5">
            {content.topTopics.map((topic) => (
              <span key={topic} className="inline-flex h-6 items-center rounded border border-rule bg-surface px-2 text-[0.75rem] text-muted">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {content.suggestedFocus && (
        <div>
          <h3 className="mb-1 text-xs text-muted">Suggested next focus</h3>
          <p className="max-w-[52ch] text-base leading-[1.7] text-muted">{content.suggestedFocus}</p>
        </div>
      )}
    </article>
  );
}

export function WeeklyReflectionEmpty() {
  return (
    <section className="mt-8">
      <p className="mb-1 text-xs text-muted">This Week</p>
      <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance">No data yet.</h2>
      <p className="mt-3 max-w-[52ch] text-base leading-[1.7] text-muted">Complete lessons throughout the week to see your reflection here on Sunday.</p>
    </section>
  );
}
