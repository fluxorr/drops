import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-context">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true">D</span>
          <span>Drops</span>
        </Link>
        <div>
          <p className="welcome-date">Start your ledger</p>
          <h1>Tell Drops what you want to understand.</h1>
        </div>
      </div>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/today" />
    </main>
  );
}
