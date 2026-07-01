"use client";

import { useEffect, useReducer } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{topicName}</DialogTitle>
          <DialogDescription>Topic preview and resources</DialogDescription>
        </DialogHeader>

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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
