"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import remarkGfm from "remark-gfm";

import type { Lesson, LessonSource } from "@/database/schemas";
import { formatLedgerDate } from "@/lib/dates";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

type HistoryFilters = {
  status: string;
  query: string;
};

function SourceList({ sources }: { sources: LessonSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-1 mt-3 pt-3 border-t border-rule">
      {sources.map((source, index) => (
        <li key={index}>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-ink no-underline hover:underline underline-offset-2">
            {source.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function LessonDetail({ lesson }: { lesson: Lesson }) {
  return (
    <div className="px-4 pb-4 pt-3 border-t border-rule">
      <p className="mb-4 max-w-[52ch] text-base leading-[1.7] text-muted">{lesson.whyThisLesson}</p>
      <div className="max-w-[68ch] text-base leading-[1.7] [&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:font-[450] [&_h1]:text-[1.25rem] [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-[450] [&_h2]:text-[1.125rem] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-[500] [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:pl-5 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9375rem] [&_code]:border [&_code]:border-rule [&_pre]:mb-4 [&_pre_code]:block [&_pre_code]:rounded-lg [&_pre_code]:bg-surface [&_pre_code]:p-4 [&_pre_code]:text-sm [&_pre_code]:border [&_pre_code]:border-rule [&_blockquote]:my-4 [&_blockquote]:ml-0 [&_blockquote]:rounded-lg [&_blockquote]:border [&_blockquote]:border-rule [&_blockquote]:bg-surface [&_blockquote]:py-2.5 [&_blockquote]:px-3.5 [&_blockquote]:text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-ink/20 [&_a]:hover:decoration-ink">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {lesson.contentMarkdown}
        </ReactMarkdown>
      </div>
      <SourceList sources={lesson.sources ?? []} />
      <p className="mt-3 text-sm text-muted">
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

  return (
    <section aria-labelledby="history-heading">
      <div className="flex flex-col gap-3 mb-8">
        <div>
          <label htmlFor="history-search-input" className="sr-only">Search lessons</label>
          <input
            id="history-search-input"
            type="search"
            placeholder="Search lessons..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="input-base"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {["", "unread", "completed", "skipped"].map((status) => (
            <button
              key={status}
              type="button"
              className={`inline-flex h-8 items-center rounded-md px-2.5 text-[0.8125rem] font-medium transition-all duration-150 ${
                filters.status === status
                  ? "bg-accent-faint text-accent"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
              onClick={() => updateFilter("status", status)}
            >
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="animate-fade-up">
          <svg viewBox="0 0 180 110" className="w-44 h-[110px] mb-5" fill="none" aria-hidden="true">
            <rect x="36" y="14" width="108" height="64" rx="4" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
            <rect x="48" y="26" width="84" height="5" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" />
            <rect x="48" y="37" width="60" height="5" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" />
            <rect x="48" y="48" width="70" height="5" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" />
            <rect x="48" y="59" width="50" height="5" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" />
            <rect x="26" y="10" width="6" height="72" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
            <path d="M38 18Q52 10 66 18" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="146" cy="34" r="2" fill="var(--color-accent)" />
            <circle cx="140" cy="62" r="1.5" fill="var(--color-rule)" />
          </svg>
          <p className="label-eyebrow mb-1">History</p>
          <h1 id="history-heading" className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-2">No lessons yet.</h1>
          <p className="mt-3 max-w-[52ch] text-base leading-[1.7] text-muted">Lessons will appear here once generated.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {lessons.map((lesson, i) => (
            <article
              key={lesson.id}
              className="animate-fade-up rounded-xl border border-rule transition-all duration-150 hover:border-ink/20"
              aria-labelledby={`lesson-${lesson.id}`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <button
                type="button"
                className="flex w-full flex-col gap-1 p-4 text-left bg-transparent border-0 cursor-pointer"
                onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <time className="text-xs text-muted">{formatLedgerDate(lesson.generatedAt)}</time>
                  <span className={`rounded border px-1.5 py-0.5 text-[0.625rem] font-medium ${
                    lesson.status === "completed" ? "border-green/30 text-green" :
                    lesson.status === "skipped" ? "border-rule text-muted" :
                    "border-rule text-muted"
                  }`}>
                    {lesson.status}
                  </span>
                </div>
                <h2 id={`lesson-${lesson.id}`} className="text-sm font-medium leading-[1.3]">
                  {lesson.title}
                </h2>
                <p className="text-sm text-muted line-clamp-2 leading-[1.5]">{lesson.whyThisLesson}</p>
              </button>
              {expanded === lesson.id && <div className="animate-slide-up"><LessonDetail lesson={lesson} /></div>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
