import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-context">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true">D</span>
          <span>Drops</span>
        </Link>
        <div>
          <p className="welcome-date">Welcome back</p>
          <h1>Pick up where your curiosity left off.</h1>
        </div>
      </div>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/today" />
    </main>
  );
}
