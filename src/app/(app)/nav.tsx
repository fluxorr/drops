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
    <nav aria-label="Primary navigation" className="flex gap-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex h-8 items-center gap-[5px] rounded-md px-2.5 text-[0.8125rem] font-medium no-underline transition-all duration-150 ${
              isActive
                ? "bg-accent-faint text-accent"
                : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            <Icon aria-hidden="true" size={14} strokeWidth={isActive ? 2 : 1.6} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
