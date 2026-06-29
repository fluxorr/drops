"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, History, Lightbulb, Settings } from "lucide-react";

const navItems = [
  { href: "/today" as const, label: "Today", icon: BookOpenText },
  { href: "/history" as const, label: "History", icon: History },
  { href: "/interests" as const, label: "Interests", icon: Lightbulb },
  { href: "/settings" as const, label: "Settings", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative inline-flex min-h-9 items-center gap-[6px] rounded-[8px] px-2.5 py-[7px] text-[0.9375rem] font-semibold no-underline transition-all duration-150 ${
              isActive
                ? "bg-moss/10 text-moss-strong"
                : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            <Icon aria-hidden="true" size={16} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{label}</span>
            {isActive && (
              <span className="absolute inset-x-2 -bottom-[13px] h-[2px] rounded-full bg-moss-strong" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
