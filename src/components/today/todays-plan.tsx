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

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" className="size-[11px]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,7 6,11 12,3" className="animate-check-draw" style={{ strokeDasharray: "16", strokeDashoffset: "16" }} />
    </svg>
  );
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
        setPlan({ topics: data.topics ?? [], reason: data.reason ?? "" });
      }).catch(() => {});
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
        setPlan({ topics: data.topics ?? [], reason: data.reason ?? "" });
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
  const top = candidates.slice(0, 5);
  const remainingCount = Math.max(0, candidates.length - top.length);

  const replaceAll = useCallback(() => {
    const toReplace = Math.min(top.length, remainingCount);
    if (toReplace <= 0) return;
    replaceTopics(top.slice(0, toReplace).map((t) => t.normalizedName));
  }, [top, remainingCount, replaceTopics]);

  const allChecked = top.length > 0 && top.every((t) => checked.includes(t.normalizedName));

  const greeting = `${getTimeGreeting()}, ${profileName.split(" ")[0]}.`;

  return (
    <section aria-labelledby="plan-heading">
      <div className="animate-fade-up">
        <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" })}
        </p>
      </div>

      {top.length > 0 ? (
        <>
          <h1
            id="plan-heading"
            className="animate-fade-up font-display text-[clamp(2rem,4.5vw,3.5rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-3"
            style={{ animationDelay: "0.05s" }}
          >
            {greeting}
          </h1>

          <div className="animate-fade-up mt-2 mb-10" style={{ animationDelay: "0.1s" }}>
            <p className="text-[1.0625rem] leading-[1.75] text-muted max-w-[58ch]">
              {plan.reason}
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-[650]">
                Today&apos;s candidates
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">
                  {checked.length}/{top.length} reviewed
                </span>
                {remainingCount > 0 && (
                  <button
                    type="button"
                    onClick={replaceAll}
                    disabled={resetting.size > 0}
                    className="text-sm font-semibold rounded-lg px-2.5 py-1 border border-rule bg-transparent text-muted/70 hover:border-muted/40 hover:text-ink transition-all duration-150 disabled:opacity-40 disabled:cursor-wait"
                  >
                    {resetting.size > 0 ? "Replacing\u2026" : `Replace ${remainingCount >= 5 ? "all" : `${remainingCount}`}`}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {top.map((topic, i) => {
                const isChecked = checked.includes(topic.normalizedName);
                const isResetting = resetting.has(topic.normalizedName);
                return (
                  <div
                    key={topic.normalizedName}
                    className={`animate-spring-up rounded-xl border transition-all duration-200 ${
                      isChecked
                        ? "border-moss/25 bg-moss/6"
                        : "border-rule bg-surface/60 hover:border-moss/30 hover:shadow-[0_2px_12px_var(--color-shadow)]"
                    }`}
                    style={{ animationDelay: `${0.2 + i * 0.06}s` }}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => toggleChecked(topic.normalizedName)}
                        aria-label={`${isChecked ? "Unmark" : "Mark"} ${topic.name}`}
                        className={`mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-md border-2 transition-all duration-200 ${
                          isChecked
                            ? "border-moss-strong bg-moss-strong text-white"
                            : "border-rule bg-transparent hover:border-moss/50"
                        }`}
                      >
                        {isChecked && <CheckIcon />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewTopic(topic.name)}
                        className="flex-1 min-w-0 text-left bg-transparent border-0 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold text-base ${isChecked ? "text-muted line-through decoration-1" : "text-ink"}`}>
                            {topic.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="rounded-md bg-moss/10 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-moss-strong uppercase tracking-wider">
                              {difficultyLabel(topic.desiredDifficulty)}
                            </span>
                            <span className={`font-display font-bold text-lg tabular-nums ${
                              topic.score >= 80 ? "text-moss-strong" : topic.score >= 50 ? "text-moss" : "text-muted"
                            }`}>
                              {topic.score}
                            </span>
                          </div>
                        </div>
                        <p className={`mt-1 text-sm leading-[1.5] line-clamp-2 ${isChecked ? "text-muted/60" : "text-muted"}`}>
                          {topic.reason}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => replaceOne(topic.normalizedName)}
                        disabled={resetting.size > 0}
                        aria-label={`Replace ${topic.name}`}
                        className="shrink-0 self-center min-h-8 px-2.5 py-1 text-[0.8125rem] font-semibold rounded-lg border bg-transparent transition-all duration-150 disabled:cursor-wait border-rule text-muted/70 hover:border-muted/40 hover:text-ink disabled:opacity-40"
                      >
                        {isResetting ? "Replacing\u2026" : "Replace"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {allChecked && (
              <div className="animate-scale-in mt-6 rounded-xl border border-moss/20 bg-moss/8 px-4 py-3">
                <p className="text-sm font-semibold text-moss-strong">
                  All reviewed. Your notification will arrive at your scheduled time.
                </p>
              </div>
            )}

            {!allChecked && remainingCount > 0 && (
              <p className="mt-6 text-sm text-muted">
                Click a topic to see resources, prerequisites, and more. Check off ones you like. {remainingCount} more candidates available.
              </p>
            )}

            {!allChecked && remainingCount === 0 && (
              <p className="mt-6 text-sm text-muted">
                Click a topic to see resources and details. Check off topics as you review them.
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
            className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-3"
          >
            {plan.reason}
          </h1>
        </div>
      )}
    </section>
  );
}
