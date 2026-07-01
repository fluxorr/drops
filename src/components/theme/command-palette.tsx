"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Command, useCommandState } from "cmdk";
import {
  BookOpenText,
  History,
  Lightbulb,
  Settings,
  Search,
  FileText,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const pages = [
  { id: "today", label: "Today", icon: BookOpenText, href: "/today", keywords: "lesson daily plan" },
  { id: "history", label: "History", icon: History, href: "/history", keywords: "past lessons archive" },
  { id: "interests", label: "Interests", icon: Lightbulb, href: "/interests", keywords: "topics subjects" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings", keywords: "preferences profile" },
];

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

function ThemePreview() {
  const { setTheme } = useTheme();
  const value = useCommandState((state) => state.value);

  useEffect(() => {
    if (!value) return;
    const match = value.match(/^theme-(.+)$/);
    if (match) {
      const entry = themes.find((t) => t.label === match[1]);
      if (entry) setTheme(entry.id);
    }
  }, [value, setTheme]);

  return null;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);
  const themeRef = useRef<string | undefined>(undefined);
  const originalTheme = useRef("default-light");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const close = useCallback(() => {
    setTheme(originalTheme.current);
    setOpen(false);
    setSearch("");
  }, [setTheme]);

  const openPalette = useCallback(() => {
    originalTheme.current = theme ?? "default-light";
    setSearch("");
    setOpen(true);
  }, [theme]);

  useEffect(() => {
    openRef.current = open;
    themeRef.current = theme;
  }, [open, theme]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (openRef.current) {
          close();
        } else {
          originalTheme.current = themeRef.current ?? "default-light";
          setSearch("");
          setOpen(true);
        }
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", handler, { capture: true });
    return () => document.removeEventListener("keydown", handler, { capture: true });
  }, [open, close]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-rule bg-transparent px-2.5 text-xs text-muted transition-all duration-150 hover:border-ink/30 hover:text-ink hover:bg-surface"
        aria-label="Open command palette"
      >
        <Search className="size-3" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded-md border border-rule/60 bg-surface/60 px-1.5 font-sans text-[0.625rem] text-muted/70">
          &#8984;K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
          onClick={close}
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[3px]" />

          <div
            className="relative w-[calc(100%-32px)] max-w-[580px] rounded-2xl border border-rule/80 bg-canvas shadow-2xl shadow-black/10 overflow-hidden animate-scale-in origin-top"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Command palette"
              className="
                [&_[cmdk-group-heading]]:text-[0.65rem]
                [&_[cmdk-group-heading]]:font-semibold
                [&_[cmdk-group-heading]]:tracking-[0.1em]
                [&_[cmdk-group-heading]]:uppercase
                [&_[cmdk-group-heading]]:text-muted
                [&_[cmdk-group-heading]]:px-4
                [&_[cmdk-group-heading]]:pb-1.5
                [&_[cmdk-group-heading]]:select-none

                [&_[cmdk-group]]:px-1.5
                [&_[cmdk-group]:first-of-type]:pt-2.5
                [&_[cmdk-group]:not(:first-of-type)]:pt-5

                [&_[cmdk-item]]:relative
                [&_[cmdk-item]]:flex
                [&_[cmdk-item]]:items-center
                [&_[cmdk-item]]:gap-3
                [&_[cmdk-item]]:w-full
                [&_[cmdk-item]]:rounded-lg
                [&_[cmdk-item]]:px-3
                [&_[cmdk-item]]:py-2.5
                [&_[cmdk-item]]:text-sm
                [&_[cmdk-item]]:text-ink
                [&_[cmdk-item]]:cursor-pointer
                [&_[cmdk-item]]:select-none
                [&_[cmdk-item]]:outline-none
                [&_[cmdk-item]]:transition-all
                [&_[cmdk-item]]:duration-150
                [&_[cmdk-item]]:data-[selected=true]:bg-accent-faint

                [&_[cmdk-empty]]:py-12
                [&_[cmdk-empty]]:text-center
                [&_[cmdk-empty]]:text-sm
                [&_[cmdk-empty]]:text-muted
              "
            >
              <ThemePreview />

              <div className="flex items-center gap-3 border-b border-rule px-4 py-3.5">
                <Search className="size-4 shrink-0 text-muted/70" />
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search pages, themes, actions..."
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/40"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex h-5 items-center rounded-md border border-rule/50 bg-surface/50 px-1.5 font-sans text-[0.625rem] text-muted/50">
                  Esc
                </kbd>
              </div>

              <Command.List className="max-h-[380px] overflow-y-auto overscroll-contain py-2.5 px-1.5">
                <Command.Empty>
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="size-8 text-muted/30" />
                    <div>
                      <p className="text-muted">
                        No results for &ldquo;<span className="text-ink font-medium">{search}</span>&rdquo;
                      </p>
                      <p className="text-xs text-muted/50 mt-0.5">
                        Try a different search term.
                      </p>
                    </div>
                  </div>
                </Command.Empty>

                <Command.Group heading="Pages">
                  {pages.map((page) => (
                    <Command.Item
                      key={page.id}
                      value={`page-${page.label}`}
                      keywords={page.keywords.split(" ")}
                      onSelect={() => {
                        setTheme(originalTheme.current);
                        setOpen(false);
                        setSearch("");
                        router.push(page.href);
                      }}
                    >
                      <page.icon className="size-4 shrink-0 text-muted" />
                      <span className="flex-1 truncate">{page.label}</span>
                      <span className="ml-auto inline-flex h-5 items-center rounded-md border border-rule/50 bg-surface/50 px-1.5 font-mono text-[0.625rem] text-muted/40 transition-all duration-150 data-[selected=true]:text-muted/70">
                        &#8629;
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Themes">
                  {themes.map((t) => (
                    <Command.Item
                      key={t.id}
                      value={`theme-${t.label}`}
                      keywords={[t.label, "theme"]}
                      onSelect={() => {
                        setTheme(t.id);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <span
                        className="size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-rule/60"
                        style={{ background: themeAccentMap[t.id] }}
                      />
                      <span className="flex-1 truncate">{t.label}</span>
                      {theme === t.id && (
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5 shrink-0 text-accent"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="border-t border-rule px-4 py-2.5 flex items-center gap-4 text-[0.625rem] text-muted/60">
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-rule/40 bg-surface/50 px-1 font-sans text-[0.5625rem] text-muted/50">&#8593;</kbd>
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-rule/40 bg-surface/50 px-1 font-sans text-[0.5625rem] text-muted/50">&#8595;</kbd>
                  <span className="ml-0.5">Navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-rule/40 bg-surface/50 px-1 font-sans text-[0.5625rem] text-muted/50">&#8629;</kbd>
                  <span className="ml-0.5">Select</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-rule/40 bg-surface/50 px-1 font-sans text-[0.5625rem] text-muted/50">Esc</kbd>
                  <span className="ml-0.5">Close</span>
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
