"use client";

import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { TopicPreviewModal } from "@/components/today/topic-preview-modal";
import type { Interest } from "@/database/schemas";

type InterestsManagerProps = {
  initialInterests: Interest[];
};

export function InterestsManager({ initialInterests }: InterestsManagerProps) {
  const [interests, setInterests] = useState(initialInterests);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(70);
  const [saving, setSaving] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [previewTopic, setPreviewTopic] = useState<string | null>(null);

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

  async function resetInterest(id: string) {
    setResettingId(id);
    try {
      const response = await fetch(`/api/interests/${id}`, { method: "PATCH" });
      if (response.ok) {
        const { interest } = await response.json();
        if (interest) {
          setInterests((prev) =>
            prev.map((i) => (i.id === id ? interest : i)).sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
      }
    } catch {
      //
    } finally {
      setResettingId(null);
    }
  }

  return (
    <section aria-labelledby="interests-heading">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <Label htmlFor="interest-name">Topic</Label>
            <Input
              id="interest-name"
              type="text"
              placeholder="e.g. Rust, Distributed Systems\u2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addInterest();
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5 w-[140px]">
            <Label htmlFor="interest-weight">
              Weight <span className="text-muted font-normal">({weight})</span>
            </Label>
            <input
              id="interest-weight"
              type="range"
              min={0}
              max={100}
              step={5}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-rule accent-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-110"
            />
          </div>
          <Button onClick={addInterest} disabled={saving || !name.trim()}>
            {saving ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full border-2 border-accent-fg/30 border-t-accent-fg animate-spin" />
                Adding
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Plus className="size-3.5" />
                Add
              </span>
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-signal">{error}</p>}
      </div>

      {interests.length === 0 ? (
        <div className="mt-8 animate-fade-up">
          <svg viewBox="0 0 180 110" className="w-44 h-[110px] mb-5" fill="none" aria-hidden="true">
            <rect x="50" y="16" width="80" height="52" rx="4" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
            <rect x="54" y="22" width="72" height="4" rx="1.5" fill="var(--color-rule/50)" />
            <path d="M80 34L100 34" stroke="var(--color-rule)" strokeWidth="1" />
            <path d="M72 40L108 40" stroke="var(--color-rule)" strokeWidth="1" />
            <path d="M86 46L94 46" stroke="var(--color-rule)" strokeWidth="1" />
            <path d="M64 40L68 32L72 40Z" fill="var(--color-accent-faint)" stroke="var(--color-accent)" strokeWidth="1" strokeLinejoin="round" />
            <path d="M90 34L93 28L96 34Z" fill="var(--color-accent-faint)" stroke="var(--color-accent)" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="34" cy="40" r="2" fill="var(--color-accent)" />
            <circle cx="148" cy="44" r="2" fill="var(--color-accent)" />
            <circle cx="144" cy="28" r="1.5" fill="var(--color-rule)" />
            <circle cx="38" cy="56" r="1.5" fill="var(--color-rule)" />
          </svg>
          <p className="label-eyebrow mb-1">Interests</p>
          <h1 id="interests-heading" className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-2">No interests yet.</h1>
          <p className="mt-3 max-w-[52ch] text-base leading-[1.7] text-muted">Add topics you want to learn about. Drops will generate lessons based on your interests.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2">
          {interests.map((interest, i) => {
            const subs = (interest as Interest & { subtopics?: string[] }).subtopics;
            return (
              <SpotlightCard key={interest.id}>
                <div
                  className="animate-fade-up group flex items-center justify-between gap-3 rounded-xl border border-rule p-3.5 transition-all duration-200 hover:border-ink/30 cursor-pointer"
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => setPreviewTopic(interest.name)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Preview ${interest.name}`}
                  onKeyDown={(e) => { if (e.key === "Enter") setPreviewTopic(interest.name); }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-ink">{interest.name}</span>
                      {interest.pinned && (
                        <span className="rounded border border-rule px-1.5 py-0.5 text-[0.625rem] font-medium text-muted">Pinned</span>
                      )}
                      {resettingId === interest.id && (
                        <span className="inline-flex items-center gap-1 rounded border border-rule px-1.5 py-0.5 text-[0.625rem] text-muted">
                          <span className="size-2 rounded-full border border-muted/50 border-t-muted animate-spin" />
                          Resetting
                        </span>
                      )}
                    </div>
                    {subs && subs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {subs.map((s, j) => (
                          <span key={j} className="rounded border border-rule bg-surface px-1.5 py-0.5 text-[0.625rem] text-muted">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="h-1 flex-1 rounded-full bg-rule overflow-hidden">
                        <span className="block h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${interest.weight}%` }} />
                      </span>
                      <span className="text-xs text-muted tabular-nums">{interest.weight}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetInterest(interest.id)}
                      disabled={resettingId === interest.id}
                      aria-label={`Reset ${interest.name} topics`}
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterest(interest.id)}
                      aria-label={`Remove ${interest.name}`}
                      className="text-muted hover:text-signal"
                    >
                      <Trash2 className="size-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {previewTopic && (
        <TopicPreviewModal
          topicName={previewTopic}
          open={!!previewTopic}
          onClose={() => setPreviewTopic(null)}
        />
      )}
    </section>
  );
}
