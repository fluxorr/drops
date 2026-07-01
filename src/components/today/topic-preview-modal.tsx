"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

export type TopicPreviewData = {
  subTopics: string[];
  resources: Array<{ title: string; url: string; description: string }>;
  prerequisites: string[];
  whyItMatters: string;
  difficultyAssessment: string;
};

type State = {
  data: TopicPreviewData | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "loading" }
  | { type: "success"; data: TopicPreviewData }
  | { type: "error"; message: string };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { data: null, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { data: null, loading: false, error: action.message };
  }
}

export function TopicPreviewModal({
  topicName,
  open,
  onClose,
}: {
  topicName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [{ data, loading, error }, dispatch] = useReducer(reducer, {
    data: null,
    loading: false,
    error: null,
  });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !topicName) return;

    const abort = new AbortController();
    dispatch({ type: "loading" });

    fetch("/api/topics/preview", {
      signal: abort.signal,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preview");
        return res.json() as Promise<TopicPreviewData>;
      })
      .then((result) => dispatch({ type: "success", data: result }))
      .catch((e) => {
        if (e.name !== "AbortError") dispatch({ type: "error", message: e.message });
      });

    return () => abort.abort();
  }, [open, topicName]);

  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-transparent p-0 backdrop:bg-black/20 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      <div className="mx-auto w-[min(100%-32px,520px)] max-h-[85vh] overflow-y-auto rounded-xl border border-rule bg-canvas p-5 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium leading-[1.2]">
            {topicName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-7 place-items-center rounded-md border-0 bg-transparent text-muted cursor-pointer hover:bg-surface hover:text-ink transition-all duration-150"
          >
            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col gap-4 py-3" aria-hidden="true">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-rule animate-shimmer" />
              <div className="h-3 w-full rounded bg-rule animate-shimmer" />
              <div className="h-3 w-11/12 rounded bg-rule animate-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-rule animate-shimmer" />
              <div className="h-3 w-2/5 rounded bg-rule animate-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-rule animate-shimmer" />
              <div className="flex flex-wrap gap-1.5">
                <div className="h-6 w-20 rounded bg-rule animate-shimmer" />
                <div className="h-6 w-28 rounded bg-rule animate-shimmer" />
                <div className="h-6 w-24 rounded bg-rule animate-shimmer" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-signal/20 bg-signal/8 px-3 py-2.5">
            <p className="text-sm text-signal">{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-4">
            <div className="animate-slide-up">
              <span className="label-eyebrow">Why it matters</span>
              <p className="mt-1 text-sm leading-[1.65] text-ink">{data.whyItMatters}</p>
            </div>

            <div className="animate-slide-up">
              <span className="label-eyebrow">Difficulty</span>
              <p className="mt-1 text-sm leading-[1.65] text-ink">{data.difficultyAssessment}</p>
            </div>

            {data.subTopics?.length > 0 && (
              <div className="animate-slide-up">
                <span className="label-eyebrow">Sub-topics</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {data.subTopics.map((s, i) => (
                    <span key={i} className="rounded border border-rule bg-surface px-2 py-0.5 text-sm text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.prerequisites.length > 0 && (
              <div className="animate-slide-up">
                <span className="label-eyebrow">Prerequisites</span>
                <ul className="mt-1.5 m-0 p-0 list-none flex flex-col gap-1">
                  {data.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink">
                      <span className="mt-[5px] size-1 shrink-0 rounded-full bg-muted" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.resources.length > 0 ? (
              <div className="animate-slide-up">
                <span className="label-eyebrow">Resources</span>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {data.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-rule p-3 no-underline transition-all duration-150 hover:border-ink/30"
                    >
                      <span className="block text-sm font-medium text-ink leading-[1.3]">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-muted leading-[1.4]">{r.description}</span>
                      <span className="mt-0.5 block text-xs text-muted break-all">{r.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-rule bg-surface px-3 py-2.5">
                <p className="text-sm text-muted">No resources found for this topic.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center rounded-md border border-rule bg-transparent px-3 text-[0.8125rem] font-medium text-ink cursor-pointer transition-all duration-150 hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
