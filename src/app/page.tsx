import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex min-h-[64px] items-center justify-between mx-auto w-[min(100%-32px,1080px)] border-b border-rule">
        <Link className="inline-flex items-center gap-2.5 font-display font-bold text-ink no-underline" href="/" aria-label="Drops home">
          <span className="grid size-[30px] place-items-center rounded-lg bg-moss-strong text-[0.8125rem] text-white" aria-hidden="true">D</span>
          <span>Drops</span>
        </Link>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[8px] border-0 bg-transparent px-3 py-[7px] text-[0.9375rem] font-semibold text-ink no-underline cursor-pointer transition-all duration-150 hover:bg-surface" type="button">Sign in</button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[8px] border-0 bg-surface px-3 py-[7px] text-[0.9375rem] font-semibold text-ink no-underline cursor-pointer transition-all duration-150 hover:brightness-95" href="/today">
            Open your ledger
          </Link>
        </Show>
      </header>

      <section className="flex-1 flex flex-col justify-center mx-auto w-[min(100%-32px,1080px)] py-20" aria-labelledby="welcome-title">
        <div className="max-w-[680px]">
          <p className="animate-fade-up mb-2 text-sm font-semibold text-moss-strong tracking-wide">
            A lesson worth keeping, every day
          </p>
          <h1 id="welcome-title" className="animate-spring-up font-display text-[clamp(2.25rem,5vw,4rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance" style={{ animationDelay: "0.1s" }}>
            Learn along a path that remembers what you&apos;ve seen.
          </h1>
          <p className="animate-fade-up mt-6 max-w-[52ch] text-[1.125rem] leading-[1.7] text-muted" style={{ animationDelay: "0.2s" }}>
            Drops turns your interests into concise, sourced lessons that build on what you
            already know. No streaks. No feed. Just the right idea to read next.
          </p>
          <div className="animate-fade-up mt-8" style={{ animationDelay: "0.3s" }}>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border-0 bg-moss-strong px-5 py-2.5 text-[0.9375rem] font-semibold leading-[1.25] text-white no-underline cursor-pointer transition-all duration-200 hover:bg-moss-strong/90 hover:shadow-[0_4px_16px_var(--color-shadow)] active:scale-[0.97]" type="button">
                  Create your learning profile
                  <ArrowRight aria-hidden="true" size={16} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-[2px]" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border-0 bg-moss-strong px-5 py-2.5 text-[0.9375rem] font-semibold leading-[1.25] text-white no-underline cursor-pointer transition-all duration-200 hover:bg-moss-strong/90 hover:shadow-[0_4px_16px_var(--color-shadow)] active:scale-[0.97]" href="/today">
                Continue learning
                <ArrowRight aria-hidden="true" size={16} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-[2px]" />
              </Link>
            </Show>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-[min(100%-32px,1080px)] border-t border-rule py-5">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-moss" /> Five to eight minutes</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-moss" /> Grounded sources</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-moss" /> A knowledge map that evolves</span>
        </div>
      </footer>
    </main>
  );
}
