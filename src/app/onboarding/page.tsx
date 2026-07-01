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
    <div className="mx-auto w-[min(100%-32px,800px)] min-h-screen">
      <header className="flex h-14 items-center justify-between border-b border-rule">
        <p className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink">
          <svg viewBox="0 0 28 28" className="size-[26px]" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="5" fill="var(--color-accent)" />
            <path d="M8 6V22M8 6H14C17 6 19.5 8.5 19.5 14C19.5 19.5 17 22 14 22H8" stroke="var(--color-canvas)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Drops</span>
        </p>
        <p className="text-sm text-muted">Step 1 of 1</p>
      </header>

      <div className="py-16 pb-24 max-sm:py-12 max-sm:pb-20 max-w-[640px]">
        <h1 className="text-[2.25rem] font-[450] leading-[1.1] tracking-[-0.02em] text-balance max-w-[12ch]">
          What are you curious about?
        </h1>
        <p className="mt-4 max-w-[44ch] text-base leading-[1.7] text-muted">
          Drops builds a learning path around your goals. You can change all of this later.
        </p>
        <div className="mt-10">
          <ProfileForm defaultName="" />
        </div>
      </div>
    </div>
  );
}
