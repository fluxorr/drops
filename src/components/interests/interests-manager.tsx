"use client";

import { useState } from "react";

import type { Interest } from "@/database/schemas";

type InterestsManagerProps = {
  initialInterests: Interest[];
};

export function InterestsManager({ initialInterests }: InterestsManagerProps) {
  const [interests, setInterests] = useState(initialInterests);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(70);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addInterest() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), weight, pinned: false }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.fields?.name?.[0] ?? "Failed to add interest");
        return;
      }

      const { interest } = await response.json();
      if (!interest) return;
      setInterests((prev) => [...prev, interest].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setWeight(70);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function removeInterest(id: string) {
    try {
      const response = await fetch(`/api/interests/${id}`, { method: "DELETE" });
      if (response.ok) {
        setInterests((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {
      //
    }
  }

  const btnBase = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-0 px-4 py-2.5 text-[0.9375rem] font-[650] leading-[1.25] no-underline cursor-pointer transition-[background] duration-180 disabled:opacity-65 disabled:cursor-not-allowed";

  return (
    <section aria-labelledby="interests-heading">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <label htmlFor="interest-name" className="text-sm font-semibold text-muted">Topic</label>
            <input
              id="interest-name"
              type="text"
              placeholder="e.g. Rust, Distributed Systems…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addInterest();
              }}
              className="h-10 rounded-lg border border-rule bg-transparent px-3 text-base outline-none transition-[border] duration-150 focus:border-moss"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-[140px]">
            <label htmlFor="interest-weight" className="text-sm font-semibold text-muted">
              Weight <span className="text-muted">({weight})</span>
            </label>
            <input
              id="interest-weight"
              type="range"
              min={0}
              max={100}
              step={5}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="accent-moss-strong"
            />
          </div>
          <button
            type="button"
            className={`${btnBase} bg-moss-strong text-white hover:bg-moss-strong/88`}
            disabled={saving || !name.trim()}
            onClick={addInterest}
          >
            Add
          </button>
        </div>
        {error && <p className="text-sm text-signal">{error}</p>}
      </div>

      {interests.length === 0 ? (
        <div className="mt-8 animate-fade-up">
          <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">Interests</p>
          <h1 id="interests-heading" className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-3">No interests yet.</h1>
          <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-muted">Add topics you want to learn about. Drops will generate lessons based on your interests.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2">
          {interests.map((interest, i) => (
            <div key={interest.id} className="animate-spring-up flex items-center justify-between gap-3 rounded-xl border border-rule bg-surface/60 p-3 transition-all duration-200 hover:border-moss/30 hover:shadow-[0_2px_12px_var(--color-shadow)]" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-[650] text-base">{interest.name}</span>
                  {interest.pinned && <span className="rounded bg-moss/12 px-1.5 py-0.5 text-[0.75rem] font-semibold text-moss-strong">Pinned</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-1 flex-1 rounded-full bg-rule overflow-hidden">
                    <span className="block h-full rounded-full bg-moss" style={{ width: `${interest.weight}%` }} />
                  </span>
                  <span className="text-sm font-semibold text-muted">{interest.weight}%</span>
                </div>
              </div>
              <button
                type="button"
                className={`${btnBase} bg-transparent text-inherit hover:bg-surface shrink-0`}
                onClick={() => removeInterest(interest.id)}
                aria-label={`Remove ${interest.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
