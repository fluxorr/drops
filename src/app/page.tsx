import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

function HeroIllustration() {
  return (
    <svg viewBox="0 0 220 140" className="w-56 h-[140px]" fill="none" aria-hidden="true">
      <rect x="58" y="18" width="104" height="78" rx="4" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
      <rect x="44" y="13" width="6" height="88" rx="1.5" stroke="var(--color-rule)" strokeWidth="1" fill="var(--color-surface)" />
      <path d="M74 38L146 38" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M74 54L130 54" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M74 70L118 70" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M88 18Q105 8 122 18" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="96" r="2" fill="var(--color-accent)" />
      <circle cx="172" cy="35" r="2" fill="var(--color-accent)" />
      <circle cx="164" cy="80" r="1.5" fill="var(--color-rule)" />
    </svg>
  );
}

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/today" as Route);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex h-14 items-center justify-between mx-auto w-[min(100%-40px,800px)] border-b border-rule">
        <Link className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink no-underline transition-opacity duration-150 hover:opacity-70" href="/" aria-label="Drops home">
          <svg viewBox="0 0 28 28" className="size-[26px]" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="5" fill="var(--color-accent)" />
            <path d="M8 6V22M8 6H14C17 6 19.5 8.5 19.5 14C19.5 19.5 17 22 14 22H8" stroke="var(--color-canvas)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Drops
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="/sign-in"
            className="inline-flex h-8 items-center justify-center rounded-md border border-rule bg-transparent px-3 text-[0.8125rem] font-medium text-ink no-underline cursor-pointer transition-all duration-150 hover:bg-surface active:scale-[0.97]"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-accent px-3 text-[0.8125rem] font-medium text-white no-underline cursor-pointer transition-all duration-150 hover:opacity-85 active:scale-[0.97]"
          >
            Get started
          </a>
        </div>
      </header>

      <section className="flex-1 flex flex-col justify-center mx-auto w-[min(100%-40px,800px)] py-24 md:py-28" aria-labelledby="welcome-title">
        <div className="flex items-start gap-16 max-lg:flex-col max-lg:gap-10">
          <div className="max-w-[520px] shrink-0">
            <p className="animate-fade-up mb-4 label-eyebrow">
              A lesson worth keeping, every day
            </p>
            <h1 id="welcome-title" className="animate-fade-up text-[clamp(2.25rem,5vw,3.5rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance" style={{ animationDelay: "0.05s" }}>
              Learn along a path<br />that remembers what<br />you&apos;ve seen.
            </h1>
            <p className="animate-fade-up mt-5 max-w-[46ch] text-base leading-[1.7] text-muted" style={{ animationDelay: "0.1s" }}>
              Drops turns your interests into concise, sourced lessons that build on what you
              already know. No streaks. No feed. Just the right idea to read next.
            </p>
            <div className="animate-fade-up mt-8 flex items-center gap-3" style={{ animationDelay: "0.15s" }}>
              <a
                href="/sign-up"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-[0.875rem] font-medium text-white no-underline cursor-pointer transition-all duration-150 hover:opacity-85 active:scale-[0.97]"
              >
                Create your learning profile
                <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
              </a>
            </div>
          </div>
          <div className="animate-fade-up pt-2 shrink-0" style={{ animationDelay: "0.2s" }}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      <footer className="mx-auto w-[min(100%-40px,800px)] border-t border-rule py-5">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <span className="animate-fade-up" style={{ animationDelay: "0.25s" }}>Five to eight minutes</span>
          <span className="animate-fade-up" style={{ animationDelay: "0.3s" }}>Grounded sources</span>
          <span className="animate-fade-up" style={{ animationDelay: "0.35s" }}>A knowledge map that evolves</span>
        </div>
      </footer>
    </main>
  );
}
