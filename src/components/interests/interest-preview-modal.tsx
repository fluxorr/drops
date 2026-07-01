"use client";

import { Layers } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type InterestDetail = {
  name: string;
  weight: number;
  pinned: boolean;
  subtopics?: string[] | null;
};

export function InterestPreviewModal({
  interest,
  open,
  onClose,
}: {
  interest: InterestDetail;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-accent-faint text-accent">
              <Layers className="size-3.5" />
            </span>
            <DialogTitle className="text-base">{interest.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex-1 h-1.5 rounded-full bg-rule overflow-hidden">
              <span
                className="block h-full rounded-full bg-accent transition-all duration-700"
                style={{ width: `${interest.weight}%` }}
              />
            </span>
            <span className="text-xs text-muted tabular-nums">{interest.weight}% weight</span>
          </div>

          {interest.pinned && (
            <div className="rounded-lg border border-rule/50 bg-surface px-3 py-2">
              <p className="text-xs text-muted">This topic is pinned and will always be considered.</p>
            </div>
          )}

          {interest.subtopics && interest.subtopics.length > 0 ? (
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted mb-2.5">
                Subtopics ({interest.subtopics.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {interest.subtopics.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-surface px-2.5 py-1 text-sm text-ink transition-colors duration-150 hover:border-ink/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-rule bg-surface/50 px-3 py-4 text-center">
              <p className="text-sm text-muted">No subtopics mapped yet.</p>
              <p className="text-xs text-muted mt-0.5">Subtopics are generated when you save an interest during onboarding.</p>
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
