"use client";

import { useCallback, useEffect, useState } from "react";

import { TopicPreviewModal } from "./topic-preview-modal";

type Topic = {
  name: string;
  normalizedName: string;
  score: number;
  reason: string;
  desiredDifficulty: number;
};

type PlanState = { topics: Topic[]; reason: string };

function getStorageKey() {
  return `drops-plan-${new Date().toLocaleDateString("en-CA")}`;
}

type StorageState = { checked: string[]; excluded: string[] };

function loadPlanState(): StorageState {
  try {
    const raw = JSON.parse(localStorage.getItem(getStorageKey()) ?? "{}");
    return {
      checked: Array.isArray(raw.checked) ? raw.checked : [],
      excluded: Array.isArray(raw.excluded) ? raw.excluded : [],
    };
  } catch {
    return { checked: [], excluded: [] };
  }
}

function savePlanState(checked: string[], excluded: string[]) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify({ checked, excluded }));
  } catch {
    //
  }
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function difficultyLabel(d: number): string {
  if (d <= 3) return "Beginner";
  if (d <= 5) return "Intermediate";
  if (d <= 7) return "Advanced";
  return "Expert";
}

async function fetchPlan(excludeTopicNames: string[]): Promise<PlanState> {
  const res = await fetch("/api/plan/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ excludeTopicNames }),
  });
  if (!res.ok) throw new Error("Failed to refresh plan");
  return res.json();
}

export function TodaysPlan({ initialPlan, profileName }: { initialPlan: PlanState; profileName: string }) {
  const [plan, setPlan] = useState(initialPlan);
  const [checked, setChecked] = useState<string[]>(() => loadPlanState().checked ?? []);
  const [excluded, setExcluded] = useState<string[]>(() => loadPlanState().excluded ?? []);
  const [resetting, setResetting] = useState<Set<string>>(new Set());
  const [previewTopic, setPreviewTopic] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadPlanState();
    if (saved.excluded.length > 0) {
      fetchPlan(saved.excluded).then((data) => {
        setPlan({ topics: data.topics ?? [], reason: "" });
      }).catch(() => { });
    }
  }, []);

  const persist = useCallback((c: string[], e: string[]) => {
    savePlanState(c, e);
  }, []);

  const toggleChecked = useCallback(
    (normalizedName: string) => {
      setChecked((prev) => {
        const next = prev.includes(normalizedName)
          ? prev.filter((n) => n !== normalizedName)
          : [...prev, normalizedName];
        persist(next, excluded);
        return next;
      });
    },
    [excluded, persist],
  );

  const replaceTopics = useCallback(
    async (targets: string[]) => {
      if (resetting.size > 0) return;
      const newExcluded = [...new Set([...excluded, ...targets])];
      setResetting(new Set(targets));
      setExcluded(newExcluded);
      persist(checked, newExcluded);
      try {
        const data = await fetchPlan(newExcluded);
        setPlan({ topics: data.topics ?? [], reason: "" });
      } catch {
        //
      } finally {
        setResetting(new Set());
      }
    },
    [resetting, excluded, checked, persist],
  );

  const replaceOne = useCallback(
    (normalizedName: string) => replaceTopics([normalizedName]),
    [replaceTopics],
  );

  const candidates = plan.topics.filter((t) => t.score > 0);

  const replaceAll = useCallback(() => {
    if (candidates.length === 0) return;
    replaceTopics(candidates.map((t) => t.normalizedName));
  }, [candidates, replaceTopics]);

  const allChecked = candidates.length > 0 && candidates.every((t) => checked.includes(t.normalizedName));

  const greeting = `${getTimeGreeting()}, ${profileName.split(" ")[0]}.`;

  return (
    <section aria-labelledby="plan-heading">
      <div className="animate-fade-up">
        <p className="label-eyebrow">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" })}
        </p>
      </div>

      {candidates.length > 0 ? (
        <>
          <h1
            id="plan-heading"
            className="animate-fade-up text-[clamp(1.75rem,4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-2"
            style={{ animationDelay: "0.05s" }}
          >
            {greeting}
          </h1>

          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-5 mt-8">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium text-ink">
                  Today&apos;s candidates
                </h2>
                <span className="text-sm text-muted">
                  {checked.length}/{candidates.length}
                </span>
              </div>
              <button
                type="button"
                onClick={replaceAll}
                disabled={resetting.size > 0}
                className="text-sm font-medium rounded-md px-2.5 py-1 border border-rule bg-transparent text-muted transition-all duration-150 hover:text-ink hover:border-ink/40 disabled:opacity-40 disabled:cursor-wait"
              >
                <span className="inline-flex items-center gap-1.5">
                  {resetting.size > 0 && <span className="size-3 rounded-full border-[1.5px] border-muted/30 border-t-muted animate-spin" />}
                  {resetting.size > 0 ? "Replacing" : "Replace all"}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {resetting.size > 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse rounded-xl border border-rule p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 size-4 shrink-0 rounded border border-rule bg-surface" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-3/4 rounded bg-rule" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-rule" />
                      </div>
                      <div className="h-6 w-16 shrink-0 rounded bg-rule" />
                    </div>
                  </div>
                ))
              ) : (
                candidates.map((topic, i) => {
                  const isChecked = checked.includes(topic.normalizedName);
                  const isResetting = resetting.has(topic.normalizedName);
                  return (
                    <div
                      key={topic.name}
                      className={`animate-fade-up rounded-xl border transition-all duration-200 ${
                        isChecked
                          ? "border-rule/50"
                          : "border-rule hover:border-ink/20"
                      }`}
                      style={{ animationDelay: `${0.15 + i * 0.04}s` }}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <button
                          type="button"
                          onClick={() => toggleChecked(topic.normalizedName)}
                          aria-label={`${isChecked ? "Unmark" : "Mark"} ${topic.name}`}
                          className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-all duration-150 ${
                            isChecked
                              ? "border-accent bg-accent text-white"
                              : "border-rule bg-transparent hover:border-ink/40"
                          }`}
                        >
                          {isChecked && (
                            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewTopic(topic.name)}
                          className="flex-1 min-w-0 text-left bg-transparent border-0 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-medium ${isChecked ? "text-muted line-through" : "text-ink"}`}>
                              {topic.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded border border-rule bg-surface px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted">
                                {difficultyLabel(topic.desiredDifficulty)}
                              </span>
                            </div>
                          </div>
                          <p className={`mt-0.5 text-sm leading-[1.6] line-clamp-2 ${isChecked ? "text-muted/60" : "text-muted"}`}>
                            {topic.reason}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => replaceOne(topic.normalizedName)}
                          disabled={resetting.size > 0}
                          aria-label={`Replace ${topic.name}`}
                          className="shrink-0 self-center h-7 px-2 text-xs font-medium rounded-md border border-rule bg-transparent transition-all duration-150 disabled:cursor-wait text-muted hover:text-ink hover:border-ink/40 disabled:opacity-40"
                        >
                          <span className="inline-flex items-center gap-1">
                            {isResetting && <span className="size-2.5 rounded-full border-[1.5px] border-muted/30 border-t-muted animate-spin" />}
                            {isResetting ? "..." : "Replace"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {allChecked && (
              <div className="animate-fade-up mt-5 rounded-xl border border-rule bg-surface px-4 py-3">
                <p className="text-sm font-medium text-ink">
                  All reviewed. Your notification will arrive at your scheduled time.
                </p>
              </div>
            )}

            {!allChecked && (
              <p className="mt-5 text-sm text-muted">
                Click a topic to see resources, prerequisites, and more. Check off topics as you review them.
              </p>
            )}
          </div>

          <TopicPreviewModal
            topicName={previewTopic ?? ""}
            open={previewTopic !== null}
            onClose={() => setPreviewTopic(null)}
          />
        </>
      ) : (
        <div className="animate-fade-up">
          <h1
            id="plan-heading"
            className="text-[clamp(1.75rem,4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-2"
          >
            {greeting}
          </h1>
          <p className="mt-4 max-w-[52ch] text-base leading-[1.7] text-muted">
            No candidates right now. Check your interests or try replacing them.
          </p>
        </div>
      )}
    </section>
  );
}
