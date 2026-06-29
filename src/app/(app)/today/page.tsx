import { auth } from "@clerk/nextjs/server";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getProfile } from "@/database/repositories/profile";

export default async function TodayPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const profile = await getProfile(userId);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");

  return (
    <section className="empty-ledger" aria-labelledby="today-heading">
      <p className="ledger-date">Today</p>
      <h1 id="today-heading">Welcome, {profile.displayName}.</h1>
      <p>
        Your profile is ready. The first generated lesson will appear here once delivery is connected.
      </p>
    </section>
  );
}
