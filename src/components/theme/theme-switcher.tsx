"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const themes = [
  { id: "default-light", label: "Default" },
  { id: "serika", label: "Serika" },
  { id: "solarized", label: "Solarized" },
  { id: "bushido", label: "Bushido" },
  { id: "coffee", label: "Coffee" },
  { id: "nord", label: "Nord" },
  { id: "monokai", label: "Monokai" },
  { id: "dracula", label: "Dracula" },
  { id: "tokyo-night", label: "Tokyo Night" },
  { id: "everforest", label: "Everforest" },
  { id: "catppuccin", label: "Catppuccin" },
  { id: "miami", label: "Miami" },
  { id: "nebula", label: "Nebula" },
  { id: "matcha", label: "Matcha" },
  { id: "cherry", label: "Cherry" },
  { id: "midnight", label: "Midnight" },
  { id: "olivia", label: "Olivia" },
  { id: "laser", label: "Laser" },
  { id: "striker", label: "Striker" },
  { id: "sky", label: "Sky" },
  { id: "terra", label: "Terra" },
  { id: "aubergine", label: "Aubergine" },
];

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function subscribe() {
  return () => {};
}

const themeAccentMap: Record<string, string> = {
  "default-light": "oklch(0.2 0 0)",
  serika: "oklch(0.6 0.18 80)",
  solarized: "oklch(0.55 0.16 190)",
  bushido: "oklch(0.55 0.22 25)",
  coffee: "oklch(0.62 0.12 70)",
  nord: "oklch(0.68 0.1 210)",
  monokai: "oklch(0.62 0.22 330)",
  dracula: "oklch(0.65 0.22 330)",
  "tokyo-night": "oklch(0.65 0.18 250)",
  everforest: "oklch(0.58 0.14 145)",
  catppuccin: "oklch(0.62 0.15 350)",
  miami: "oklch(0.7 0.25 340)",
  nebula: "oklch(0.6 0.2 270)",
  matcha: "oklch(0.55 0.14 145)",
  cherry: "oklch(0.55 0.22 10)",
  midnight: "oklch(0.5 0.15 260)",
  olivia: "oklch(0.6 0.2 25)",
  laser: "oklch(0.65 0.2 200)",
  striker: "oklch(0.65 0.22 55)",
  sky: "oklch(0.55 0.14 220)",
  terra: "oklch(0.55 0.18 50)",
  aubergine: "oklch(0.55 0.18 300)",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-all duration-150 hover:bg-surface hover:text-ink"
        aria-label="Change theme"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative group/theme">
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-all duration-150 hover:bg-surface hover:text-ink"
        aria-label="Change theme"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 z-30 min-w-[160px] origin-top-right rounded-lg border border-rule bg-canvas p-1.5 shadow-lg opacity-0 invisible group-hover/theme:opacity-100 group-hover/theme:visible transition-all duration-150 translate-y-1 group-hover/theme:translate-y-0">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-left transition-all duration-100 ${
                isActive
                  ? "bg-accent-faint text-accent font-medium"
                  : "text-muted hover:text-ink hover:bg-surface"
              }`}
            >
              <span
                className="size-3 rounded-full border border-rule shrink-0"
                style={{ background: themeAccentMap[t.id] || "var(--color-accent)" }}
              />
              {t.label}
              {isActive && (
                <svg viewBox="0 0 12 12" className="size-2.5 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
