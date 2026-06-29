import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getProfileWithSettings } from "@/database/repositories/profile";

import { PreferencesForm } from "./preferences-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const result = await getProfileWithSettings(userId);
  if (!result?.profile.onboardingCompletedAt || !result.settings) redirect("/onboarding");

  return (
    <div>
      <header className="mb-8">
        <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">Preferences</p>
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-1">Settings</h1>
        <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-muted">Keep the profile useful and choose when Drops should arrive.</p>
      </header>
      <PreferencesForm profile={result.profile} settings={result.settings} />
    </div>
  );
}
