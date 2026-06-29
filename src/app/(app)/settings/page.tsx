import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getProfileWithSettings } from "@/database/repositories/profile";

import { PreferencesForm } from "./preferences-form";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const result = await getProfileWithSettings(userId);
  if (!result?.profile.onboardingCompletedAt || !result.settings) redirect("/onboarding");

  return (
    <div className="settings-page">
      <header className="page-heading">
        <p className="ledger-date">Preferences</p>
        <h1 className="page-title">Settings</h1>
        <p>Keep the profile useful and choose when Drops should arrive.</p>
      </header>
      <PreferencesForm profile={result.profile} settings={result.settings} />
    </div>
  );
}
