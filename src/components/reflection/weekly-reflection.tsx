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
    <article className="mt-8 rounded-lg border border-rule bg-surface p-5" aria-labelledby={`reflection-${reflection.id}`}>
      <p className="mb-2 text-sm font-semibold text-muted">
        Week of {formatLedgerDate(reflection.weekStartedAt)}
      </p>

      <h2 id={`reflection-${reflection.id}`} className="font-display text-xl font-[650] leading-[1.15] mt-4 mb-3">
        Weekly Reflection
      </h2>

      {content.narrative && (
        <p className="mb-5 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-muted">{content.narrative}</p>
      )}

      <div className="flex gap-6 mb-5">
        <div className="flex flex-col">
          <span className="font-display text-2xl font-[650] text-moss-strong">{content.completedLessons}</span>
          <span className="text-sm text-muted">lessons completed</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-2xl font-[650] text-moss-strong">{content.newConcepts}</span>
          <span className="text-sm text-muted">new concepts</span>
        </div>
      </div>

      {content.topTopics.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-muted">Top topics</h3>
          <div className="flex flex-wrap gap-1.5">
            {content.topTopics.map((topic) => (
              <span key={topic} className="inline-flex min-h-7 items-center rounded-full bg-moss/12 px-2.5 py-0.5 text-[0.8125rem] font-semibold text-moss-strong">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {content.suggestedFocus && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-muted">Suggested next focus</h3>
          <p className="max-w-[52ch] text-[1.0625rem] leading-[1.7] text-muted">{content.suggestedFocus}</p>
        </div>
      )}
    </article>
  );
}

export function WeeklyReflectionEmpty() {
  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-muted">This Week</p>
      <h2 className="font-display text-[2.75rem] font-[650] leading-[1.05] -tracking-[0.035em] text-balance max-sm:text-[2.25rem]">No data yet.</h2>
      <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-muted">Complete lessons throughout the week to see your reflection here on Sunday.</p>
    </section>
  );
}
