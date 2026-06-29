import { auth } from "@clerk/nextjs/server";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getProfile } from "@/database/repositories/profile";
import { listInterests } from "@/database/repositories/interests";
import { InterestsManager } from "@/components/interests/interests-manager";

export const dynamic = "force-dynamic";

export default async function InterestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const profile = await getProfile(userId);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");

  const interests = await listInterests(userId);

  return (
    <div aria-labelledby="interests-heading">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">Topics</p>
        <h1 id="interests-heading" className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-1">Interests</h1>
        <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-muted">Topics you want to learn about. Drops scores and selects the most relevant topic for each daily lesson.</p>
      </div>
      <InterestsManager initialInterests={interests} />
    </div>
  );
}
