"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

export type TopicPreviewData = {
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
      className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      <div className="mx-auto w-[min(100%-32px,560px)] max-h-[85vh] overflow-y-auto rounded-2xl border border-rule bg-canvas p-6 shadow-[0_16px_48px_var(--color-shadow)] animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-[700] leading-[1.15] -tracking-[0.02em]">
            {topicName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg border-0 bg-transparent text-muted cursor-pointer hover:bg-surface hover:text-ink transition-colors duration-150"
          >
            <svg viewBox="0 0 14 14" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col gap-3 py-8">
            <div className="h-4 w-3/4 rounded bg-surface animate-shimmer" />
            <div className="h-4 w-1/2 rounded bg-surface animate-shimmer" />
            <div className="h-20 rounded-lg bg-surface animate-shimmer" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-signal/20 bg-signal/8 px-4 py-3">
            <p className="text-sm text-signal">{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">Why it matters</span>
              <p className="mt-1.5 text-sm leading-[1.65] text-ink">{data.whyItMatters}</p>
            </div>

            <div>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">Difficulty</span>
              <p className="mt-1.5 text-sm leading-[1.65] text-ink">{data.difficultyAssessment}</p>
            </div>

            {data.prerequisites.length > 0 && (
              <div>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">Prerequisites</span>
                <ul className="mt-1.5 m-0 p-0 list-none flex flex-col gap-1">
                  {data.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-moss" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.resources.length > 0 && (
              <div>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">Resources</span>
                <div className="mt-1.5 flex flex-col gap-2">
                  {data.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-rule bg-surface/60 p-3 no-underline transition-all duration-150 hover:border-moss/30 hover:shadow-[0_2px_8px_var(--color-shadow)]"
                    >
                      <span className="block text-sm font-semibold text-ink leading-[1.3]">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-muted leading-[1.4]">{r.description}</span>
                      <span className="mt-1 block text-xs text-moss-strong break-all">{r.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rule bg-transparent px-4 py-1.5 text-[0.875rem] font-semibold text-ink cursor-pointer transition-all duration-150 hover:bg-surface active:scale-[0.97]"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
