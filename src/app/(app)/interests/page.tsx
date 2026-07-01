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
        <p className="label-eyebrow">Topics</p>
        <h1 id="interests-heading" className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-1">Interests</h1>
        <p className="mt-2 max-w-[52ch] text-base leading-[1.7] text-muted">Topics you want to learn about. Drops scores and selects the most relevant topic for each daily lesson.</p>
      </div>
      <InterestsManager initialInterests={interests} />
    </div>
  );
}
