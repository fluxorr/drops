"use client";

import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

export function TimePicker({
  value,
  onChange,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}) {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  const [h, m] = value.split(":");

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative flex-1">
        <select
          id={id}
          value={h || "09"}
          onChange={(e) => onChange(`${e.target.value}:${m || "00"}`)}
          className="flex h-9 w-full rounded-md border border-rule bg-transparent pl-3 pr-8 py-1 text-sm text-ink transition-colors duration-150 appearance-none cursor-pointer focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-faint hover:border-ink/30"
        >
          {hours.map((hr) => (
            <option key={hr} value={hr} className="bg-canvas text-ink">
              {hr}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">hr</span>
      </div>
      <span className="text-muted shrink-0">:</span>
      <div className="relative flex-1">
        <select
          value={m || "00"}
          onChange={(e) => onChange(`${h || "09"}:${e.target.value}`)}
          className="flex h-9 w-full rounded-md border border-rule bg-transparent pl-3 pr-8 py-1 text-sm text-ink transition-colors duration-150 appearance-none cursor-pointer focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-faint hover:border-ink/30"
        >
          {minutes.map((min) => (
            <option key={min} value={min} className="bg-canvas text-ink">
              {min}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">min</span>
      </div>
      <Clock className="size-4 text-muted shrink-0" />
    </div>
  );
}
