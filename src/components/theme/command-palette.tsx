"use client";

import { useCallback, useEffect, useState } from "react";
import { Command } from "cmdk";
import {
  BookOpenText,
  History,
  Lightbulb,
  Settings,
  Search,
  Sun,
  Moon,
  ArrowRight,
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
  { id: "default-light", label: "Default", icon: Sun },
  { id: "serika", label: "Serika", icon: Sun },
  { id: "solarized", label: "Solarized", icon: Sun },
  { id: "bushido", label: "Bushido", icon: Moon },
  { id: "coffee", label: "Coffee", icon: Moon },
  { id: "nord", label: "Nord", icon: Moon },
  { id: "monokai", label: "Monokai", icon: Moon },
  { id: "dracula", label: "Dracula", icon: Moon },
  { id: "tokyo-night", label: "Tokyo Night", icon: Moon },
  { id: "everforest", label: "Everforest", icon: Moon },
  { id: "catppuccin", label: "Catppuccin", icon: Moon },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const runAction = useCallback(
    (action: () => void) => {
      setOpen(false);
      setSearch("");
      action();
    },
    [],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-rule bg-transparent px-2.5 text-xs text-muted transition-all duration-150 hover:border-ink/30 hover:text-ink"
        aria-label="Open command palette"
      >
        <Search className="size-3" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-rule bg-surface px-1 text-[0.625rem] text-muted">
          ⌘K
        </kbd>
      </button>

      <div
        className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}
        onClick={() => setOpen(false)}
      >
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      </div>

      <div
        className={`fixed left-1/2 top-[15%] z-50 w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 rounded-xl border border-rule bg-canvas shadow-2xl overflow-hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="[cmdk-group-heading]:text-[0.6875rem] [cmdk-group-heading]:font-semibold [cmdk-group-heading]:tracking-wide [cmdk-group-heading]:uppercase [cmdk-group-heading]:text-muted [cmdk-group-heading]:px-4 [cmdk-group-heading]:pb-1.5 [cmdk-group]:pt-3 [cmdk-group]:pb-0 [cmdk-group]:px-0 [cmdk-item]:flex [cmdk-item]:items-center [cmdk-item]:gap-2.5 [cmdk-item]:rounded-md [cmdk-item]:px-3 [cmdk-item]:py-2 [cmdk-item]:text-sm [cmdk-item]:text-ink [cmdk-item]:cursor-pointer [cmdk-item]:transition-colors [cmdk-item]:duration-100 [cmdk-item[data-selected=true]]:bg-surface [cmdk-item[data-disabled=true]]:opacity-50 [cmdk-item[data-disabled=true]]:cursor-not-allowed">
          <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
            <Search className="size-4 text-muted shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, themes, actions\u2026"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              autoFocus
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto px-3 pb-3">
            <Command.Empty className="py-6 text-center text-sm text-muted">
              <p>No results found.</p>
              <p className="text-xs text-muted mt-1">Try a different search term.</p>
            </Command.Empty>

            <Command.Group heading="Pages">
              {pages.map((page) => (
                <Command.Item
                  key={page.id}
                  value={`page-${page.label}`}
                  keywords={[page.label, ...page.keywords.split(" ")]}
                  onSelect={() =>
                    runAction(() => router.push(page.href))
                  }
                >
                  <page.icon className="size-4 text-muted" />
                  <span>{page.label}</span>
                  <ArrowRight className="size-3 text-muted ml-auto opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Themes">
              {themes.map((t) => (
                <Command.Item
                  key={t.id}
                  value={`theme-${t.label}`}
                  keywords={[t.label, "theme"]}
                  onSelect={() => runAction(() => setTheme(t.id))}
                >
                  <t.icon className="size-4 text-muted" />
                  <span>{t.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="border-t border-rule px-4 py-2 flex items-center gap-3 text-[0.6875rem] text-muted">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-rule px-1 text-[0.5625rem]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-rule px-1 text-[0.5625rem]">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-rule px-1 text-[0.5625rem]">Esc</kbd>
              Close
            </span>
          </div>
        </Command>
      </div>
    </>
  );
}
