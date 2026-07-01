"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import remarkGfm from "remark-gfm";

import type { Lesson, LessonSource } from "@/database/schemas";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

/* eslint-disable @next/next/no-img-element */

function SourceList({ sources }: { sources: LessonSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-rule">
      <h2 className="mb-3 label-eyebrow">Sources</h2>
      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-ink no-underline hover:underline underline-offset-2"
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
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => <h1 className="mt-10 mb-4 font-[450] text-[1.5rem] leading-[1.2] tracking-[-0.02em]" {...props} />,
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => <h2 className="mt-8 mb-3 font-[450] text-[1.25rem] leading-[1.2] tracking-[-0.015em]" {...props} />,
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => <h3 className="mt-6 mb-2 font-[500] text-[1.0625rem] leading-[1.2]" {...props} />,
  p: (props: React.ComponentPropsWithoutRef<"p">) => <p className="mb-4" {...props} />,
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => <ul className="mb-4 pl-6" {...props} />,
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => <ol className="mb-4 pl-6" {...props} />,
  li: (props: React.ComponentPropsWithoutRef<"li">) => {
    if (props.className?.includes("task-list-item")) {
      return <li className="mb-1.5 list-none -ml-6" {...props} />;
    }
    return <li className="mb-1.5" {...props} />;
  },
  code: (props: React.ComponentPropsWithoutRef<"code">) => {
    const isInline = !props.className;
    return isInline ? (
      <code className="rounded bg-surface px-[4px] py-[1px] text-[0.9375rem] font-medium text-ink border border-rule" {...props} />
    ) : (
      <code className="block rounded-lg bg-surface p-4 text-sm leading-[1.65] overflow-x-auto border border-rule" {...props} />
    );
  },
  pre: (props: React.ComponentPropsWithoutRef<"pre">) => <pre className="mb-5" {...props} />,
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-6 ml-0 rounded-lg bg-surface px-4 py-3 text-muted border border-rule" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => <a target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2 decoration-1 decoration-ink/20 hover:decoration-ink transition-all duration-150" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => <strong className="font-[550]" {...props} />,
  hr: (props: React.ComponentPropsWithoutRef<"hr">) => <hr className="my-8 border-rule" {...props} />,
  img: (props: React.ComponentPropsWithoutRef<"img">) => <img className="rounded-lg my-6 w-full border border-rule" {...props} alt={props.alt ?? ""} />,
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
    <article aria-labelledby="lesson-title" className="max-w-[680px] mx-auto">
      <div className="animate-fade-up mb-10 pb-6 border-b border-rule">
        <p className="label-eyebrow mb-2">
          Today&apos;s lesson
        </p>
        <h1
          id="lesson-title"
          className="text-[clamp(1.75rem,4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mb-3"
        >
          {lesson.title}
        </h1>
        <p className="max-w-[54ch] text-base leading-[1.7] text-muted">
          {lesson.whyThisLesson}
        </p>
        <div className="mt-3 flex items-center gap-1 text-sm text-muted">
          <span>{lesson.readMinutes} min read</span>
          {lesson.generatorModel && <><span>&middot;</span><span>{lesson.generatorModel}</span></>}
        </div>
      </div>

      <div className="animate-fade-up text-base leading-[1.8] max-w-[68ch]" style={{ animationDelay: "0.06s" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {lesson.contentMarkdown}
        </ReactMarkdown>
      </div>

      <SourceList sources={lesson.sources ?? []} />

      <div className="animate-fade-up mt-12 flex gap-3 pb-10" style={{ animationDelay: "0.1s" }}>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-[0.875rem] font-medium text-white cursor-pointer transition-all duration-150 hover:opacity-85 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving || lesson.status !== "unread"}
          onClick={() => markStatus("completed")}
        >
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
              Completed
            </span>
          ) : (
            "Mark as done"
          )}
        </button>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-md border border-rule bg-transparent px-3.5 text-[0.875rem] font-medium text-ink cursor-pointer transition-all duration-150 hover:bg-surface active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving || lesson.status !== "unread"}
          onClick={() => markStatus("skipped")}
        >
          {isSkipped ? "Skipped" : "Skip this one"}
        </button>
      </div>
    </article>
  );
}

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 180 110" className="w-44 h-[110px]" fill="none" aria-hidden="true">
      <rect x="48" y="14" width="84" height="60" rx="4" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
      <rect x="36" y="10" width="5" height="68" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
      <path d="M60 30L120 30" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M60 44L104 44" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M60 58L92 58" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M72 14Q86 6 100 14" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="42" cy="72" r="2" fill="var(--color-accent)" />
      <circle cx="140" cy="34" r="2" fill="var(--color-accent)" />
      <circle cx="134" cy="66" r="1.5" fill="var(--color-rule)" />
    </svg>
  );
}

export function EmptyToday() {
  return (
    <section aria-labelledby="empty-heading" className="animate-fade-up">
      <div className="mb-5">
        <EmptyIllustration />
      </div>
      <p className="label-eyebrow">
        {new Date().toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" })}
      </p>
      <h1
        id="empty-heading"
        className="text-[clamp(1.75rem,4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-2"
      >
        All caught up.
      </h1>
      <p className="mt-4 max-w-[52ch] text-base leading-[1.7] text-muted">
        You have no unread lessons. A new one will arrive at your scheduled delivery time.
      </p>
    </section>
  );
}
