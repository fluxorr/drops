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
        <p className="label-eyebrow">Preferences</p>
        <h1 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-1">Settings</h1>
        <p className="mt-2 max-w-[52ch] text-base leading-[1.7] text-muted">Keep the profile useful and choose when Drops should arrive.</p>
      </header>
      <PreferencesForm profile={result.profile} settings={result.settings} />
    </div>
  );
}
