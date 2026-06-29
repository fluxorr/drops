import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="welcome-shell">
      <header className="welcome-header">
        <Link className="wordmark" href="/" aria-label="Drops home">
          <span className="wordmark-mark" aria-hidden="true">D</span>
          <span>Drops</span>
        </Link>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="button button-ghost" type="button">Sign in</button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link className="button button-secondary" href="/today">
            Open your ledger
          </Link>
        </Show>
      </header>

      <section className="welcome-copy" aria-labelledby="welcome-title">
        <p className="welcome-date">A lesson worth keeping, every day</p>
        <h1 id="welcome-title">Learn along a path that remembers where you&apos;ve been.</h1>
        <p>
          Drops turns your interests into concise, sourced lessons that build on what you
          already know. No streaks. No feed. Just the right idea to read next.
        </p>
        <div className="welcome-actions">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="button button-primary" type="button">
                Create your learning profile
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link className="button button-primary" href="/today">
              Continue learning
              <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </Show>
        </div>
      </section>

      <footer className="welcome-footnote">
        <span>Five to eight minutes</span>
        <span>Grounded sources</span>
        <span>A knowledge map that grows quietly</span>
      </footer>
    </main>
  );
}
