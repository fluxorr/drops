import { auth, currentUser } from "@clerk/nextjs/server";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfile } from "@/database/repositories/profile";

import { ProfileForm } from "./profile-form";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const existingProfile = await getProfile(userId);
  if (existingProfile?.onboardingCompletedAt) redirect("/today");

  const user = await currentUser();
  const defaultName = user?.firstName ?? user?.fullName ?? "";

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark" aria-hidden="true">D</span>
          <span>Drops</span>
        </Link>
        <p>About two minutes</p>
      </header>

      <div className="onboarding-grid">
        <section className="onboarding-intro" aria-labelledby="onboarding-title">
          <p className="welcome-date">Set the first direction</p>
          <h1 id="onboarding-title">Begin with what you&apos;re curious about.</h1>
          <p>
            This is a starting point, not a test. Drops will learn from the lessons you finish
            and quietly adjust what comes next.
          </p>
        </section>
        <ProfileForm defaultName={defaultName} />
      </div>
    </main>
  );
}
