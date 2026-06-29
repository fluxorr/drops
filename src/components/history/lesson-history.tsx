"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Lesson, LessonSource } from "@/database/schemas";
import { formatLedgerDate } from "@/lib/dates";

type HistoryFilters = {
  status: string;
  query: string;
};

function SourceList({ sources }: { sources: LessonSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-1.5 mt-4 pt-4 border-t border-rule">
      {sources.map((source, index) => (
        <li key={index}>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-moss-strong no-underline hover:underline underline-offset-2">
            {source.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function LessonDetail({ lesson }: { lesson: Lesson }) {
  return (
    <div className="px-4 pb-5 pt-2 border-t border-rule">
      <p className="mb-5 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-muted italic">{lesson.whyThisLesson}</p>
      <div className="max-w-[68ch] text-[1.0625rem] leading-[1.7] [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:font-display [&_h1]:font-[650] [&_h1]:text-[1.375rem] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:font-[650] [&_h2]:text-[1.125rem] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:font-[650] [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:pl-6 [&_li]:mb-1.5 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9375rem] [&_pre]:mb-5 [&_pre_code]:block [&_pre_code]:rounded-lg [&_pre_code]:bg-surface [&_pre_code]:p-4 [&_pre_code]:text-sm [&_pre_code]:leading-[1.6] [&_pre_code]:overflow-x-auto [&_blockquote]:my-5 [&_blockquote]:ml-0 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-3 [&_blockquote]:border-moss [&_blockquote]:bg-surface [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-5 [&_blockquote]:text-muted [&_a]:text-moss-strong [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-moss [&_input[type=checkbox]]:accent-moss-strong">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {lesson.contentMarkdown}
        </ReactMarkdown>
      </div>
      <SourceList sources={lesson.sources ?? []} />
      <p className="mt-4 text-sm text-muted">
        {lesson.readMinutes} min &middot; {lesson.generatorModel}
      </p>
    </div>
  );
}

export function LessonHistory({ initialLessons }: { initialLessons: Lesson[] }) {
  const [lessons, setLessons] = useState(initialLessons);
  const [filters, setFilters] = useState<HistoryFilters>({ status: "", query: "" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchLessons = useCallback(async (f: HistoryFilters) => {
    const params = new URLSearchParams();
    if (f.status) params.set("status", f.status);
    if (f.query.trim()) params.set("q", f.query.trim());

    const response = await fetch(`/api/lessons?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      setLessons(Array.isArray(data) ? data : []);
    }
  }, []);

  function updateFilter(key: keyof HistoryFilters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLessons(next), 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const chipBase = "inline-flex min-h-8 items-center justify-center rounded-full border-0 bg-transparent px-3 py-1 text-[0.8125rem] font-semibold no-underline cursor-pointer transition-[background,color] duration-150";

  return (
    <section aria-labelledby="history-heading">
      <div className="flex flex-col gap-3 mb-8 max-sm:gap-2">
        <div>
          <label htmlFor="history-search-input" className="sr-only">Search lessons</label>
          <input
            id="history-search-input"
            type="search"
            placeholder="Search lessons…"
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="h-10 w-full rounded-lg border border-rule bg-transparent px-3 text-base outline-none transition-[border] duration-150 focus:border-moss"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["", "unread", "completed", "skipped"].map((status) => (
            <button
              key={status}
              type="button"
              className={`${chipBase} ${filters.status === status ? "bg-moss-strong text-white" : "text-muted hover:bg-surface hover:text-ink"}`}
              onClick={() => updateFilter("status", status)}
            >
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="animate-fade-up">
          <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">History</p>
          <h1 id="history-heading" className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-3">No lessons yet.</h1>
          <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-muted">Lessons will appear here once generated.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lessons.map((lesson, i) => (
            <article
              key={lesson.id}
              className="animate-spring-up rounded-xl border border-rule bg-surface/60 transition-all duration-200 hover:border-moss/30 hover:shadow-[0_2px_12px_var(--color-shadow)]"
              aria-labelledby={`lesson-${lesson.id}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <button
                type="button"
                className="flex w-full flex-col gap-1 p-4 text-left bg-transparent border-0 cursor-pointer"
                onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
              >
                <div className="flex items-center gap-3 mb-1">
                  <time className="text-sm font-semibold text-muted">{formatLedgerDate(lesson.generatedAt)}</time>
                  <span className={`rounded px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider ${
                    lesson.status === "completed" ? "bg-moss/12 text-moss-strong" :
                    lesson.status === "skipped" ? "bg-surface text-muted" :
                    "bg-signal/10 text-signal"
                  }`}>
                    {lesson.status}
                  </span>
                </div>
                <h2 id={`lesson-${lesson.id}`} className="font-display text-lg font-[650] leading-[1.2]">
                  {lesson.title}
                </h2>
                <p className="text-sm text-muted line-clamp-2">{lesson.whyThisLesson}</p>
              </button>
              {expanded === lesson.id && <LessonDetail lesson={lesson} />}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
