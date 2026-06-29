"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* eslint-disable @next/next/no-img-element */
import type { Lesson, LessonSource } from "@/database/schemas";

function SourceList({ sources }: { sources: LessonSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-rule">
      <h2 className="mb-4 font-display text-base font-[650] tracking-wide text-muted uppercase">Sources</h2>
      <ul className="m-0 p-0 list-none flex flex-col gap-2">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.9375rem] font-semibold text-moss-strong no-underline hover:underline underline-offset-2"
            >
              {source.title}
            </a>
            {source.publisher && (
              <span className="text-sm text-muted"> &middot; {source.publisher}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const markdownComponents = {
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => <h1 className="mt-12 mb-5 font-display font-[700] text-[1.75rem] leading-[1.2] -tracking-[0.02em]" {...props} />,
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => <h2 className="mt-10 mb-4 font-display font-[650] text-[1.375rem] leading-[1.2] -tracking-[0.015em]" {...props} />,
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => <h3 className="mt-8 mb-3 font-display font-[650] text-[1.125rem] leading-[1.2]" {...props} />,
  p: (props: React.ComponentPropsWithoutRef<"p">) => <p className="mb-5" {...props} />,
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => <ul className="mb-5 pl-6" {...props} />,
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => <ol className="mb-5 pl-6" {...props} />,
  li: (props: React.ComponentPropsWithoutRef<"li">) => {
    if (props.className?.includes("task-list-item")) {
      return <li className="mb-1.5 list-none -ml-6 [&_input]:accent-moss-strong [&_input]:mr-2" {...props} />;
    }
    return <li className="mb-1.5" {...props} />;
  },
  code: (props: React.ComponentPropsWithoutRef<"code">) => {
    const isInline = !props.className;
    return isInline ? (
      <code className="rounded-md bg-surface px-[5px] py-[2px] text-[0.9375rem] font-semibold text-ink" {...props} />
    ) : (
      <code className="block rounded-xl bg-surface p-5 text-sm leading-[1.65] overflow-x-auto" {...props} />
    );
  },
  pre: (props: React.ComponentPropsWithoutRef<"pre">) => <pre className="mb-6" {...props} />,
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-7 ml-0 rounded-xl bg-surface px-5 py-4 text-muted border border-rule" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => <a target="_blank" rel="noopener noreferrer" className="text-moss-strong underline underline-offset-2 decoration-1 decoration-moss/30 hover:decoration-moss-strong transition-all duration-150" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => <strong className="font-[650]" {...props} />,
  hr: (props: React.ComponentPropsWithoutRef<"hr">) => <hr className="my-10 border-rule" {...props} />,
  img: (props: React.ComponentPropsWithoutRef<"img">) => <img className="rounded-xl my-8 w-full" {...props} alt={props.alt ?? ""} />,
};

export function LessonReader({ lesson }: { lesson: Lesson }) {
  const [isCompleted, setIsCompleted] = useState(lesson.status === "completed");
  const [isSkipped, setIsSkipped] = useState(lesson.status === "skipped");
  const [saving, setSaving] = useState(false);

  async function markStatus(status: "completed" | "skipped") {
    if (saving || lesson.status !== "unread") return;
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        if (status === "completed") { setIsCompleted(true); setIsSkipped(false); }
        else { setIsSkipped(true); setIsCompleted(false); }
      }
    } catch {
      //
    } finally {
      setSaving(false);
    }
  }

  return (
    <article aria-labelledby="lesson-title" className="max-w-[720px] mx-auto">
      <div className="animate-fade-up mb-12 pb-8 border-b border-rule">
        <p className="text-sm font-semibold tracking-wide text-moss-strong mb-3">
          Today&apos;s lesson
        </p>
        <h1
          id="lesson-title"
          className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mb-4"
        >
          {lesson.title}
        </h1>
        <p className="max-w-[58ch] text-[1.0625rem] leading-[1.75] text-muted italic">
          {lesson.whyThisLesson}
        </p>
        <div className="mt-4 flex items-center gap-1 text-sm text-muted">
          <span>{lesson.readMinutes} min read</span>
          {lesson.generatorModel && <><span>&middot;</span><span>{lesson.generatorModel}</span></>}
        </div>
      </div>

      <div className="animate-fade-up text-[1.0625rem] leading-[1.8] max-w-[68ch] [&_input[type=checkbox]]:accent-moss-strong" style={{ animationDelay: "0.1s" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {lesson.contentMarkdown}
        </ReactMarkdown>
      </div>

      <SourceList sources={lesson.sources ?? []} />

      <div className="animate-fade-up mt-16 flex gap-3 pb-12" style={{ animationDelay: "0.15s" }}>
        <button
          type="button"
          className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border-0 bg-moss-strong px-5 py-2.5 text-[0.9375rem] font-semibold leading-[1.25] text-white no-underline cursor-pointer transition-all duration-200 hover:bg-moss-strong/90 hover:shadow-[0_4px_16px_var(--color-shadow)] active:scale-[0.97] disabled:opacity-65 disabled:cursor-not-allowed disabled:hover:shadow-none"
          disabled={saving || lesson.status !== "unread"}
          onClick={() => markStatus("completed")}
        >
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 14 14" className="size-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,7 6,11 12,3" />
              </svg>
              Completed
            </span>
          ) : (
            "Mark as done"
          )}
        </button>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-rule bg-transparent px-5 py-2.5 text-[0.9375rem] font-semibold leading-[1.25] text-ink no-underline cursor-pointer transition-all duration-150 hover:bg-surface active:scale-[0.97] disabled:opacity-65 disabled:cursor-not-allowed"
          disabled={saving || lesson.status !== "unread"}
          onClick={() => markStatus("skipped")}
        >
          {isSkipped ? "Skipped" : "Skip this one"}
        </button>
      </div>
    </article>
  );
}

export function EmptyToday() {
  return (
    <section aria-labelledby="empty-heading" className="animate-fade-up">
      <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">
        {new Date().toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" })}
      </p>
      <h1
        id="empty-heading"
        className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-3"
      >
        All caught up.
      </h1>
      <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-muted">
        You have no unread lessons. A new one will arrive at your scheduled delivery time.
      </p>
    </section>
  );
}
