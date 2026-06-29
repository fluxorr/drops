import { auth } from "@clerk/nextjs/server";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getProfile } from "@/database/repositories/profile";
import { ProfileForm } from "./profile-form";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const profile = await getProfile(userId);
  if (profile?.onboardingCompletedAt) redirect("/today" as Route);

  return (
    <div className="mx-auto w-[min(100%-32px,960px)] min-h-screen">
      <header className="flex min-h-[72px] items-center justify-between border-b border-rule">
        <p className="inline-flex items-center gap-2.5 font-display font-bold text-ink">
          <span className="grid size-8 place-items-center rounded-full bg-moss-strong text-sm text-white" aria-hidden="true">D</span>
          <span>Drops</span>
        </p>
        <p className="text-sm text-muted">Step 1 of 1</p>
      </header>

      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-20 py-[72px] pb-24 max-md:grid-cols-1 max-md:gap-12 max-md:py-14 max-md:pb-20">
        <div className="sticky top-[120px] self-start max-md:static">
          <h1 className="font-display text-[2.75rem] font-[650] leading-[1.05] -tracking-[0.035em] text-balance max-w-[11ch] max-sm:text-[2.25rem]">
            What are you curious about?
          </h1>
          <p className="mt-5 max-w-[44ch] text-[1.0625rem] leading-[1.7] text-muted">
            Drops builds a learning path around your goals. You can change all of this later.
          </p>
        </div>

        <ProfileForm defaultName="" />
      </div>
    </div>
  );
}
