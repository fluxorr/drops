import { auth } from "@clerk/nextjs/server";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getProfile } from "@/database/repositories/profile";
import { listLessons } from "@/database/repositories/lessons";
import { LessonHistory } from "@/components/history/lesson-history";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const profile = await getProfile(userId);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");

  const lessons = await listLessons(userId, { limit: 50 });

  return (
    <div aria-labelledby="history-heading">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold tracking-wide text-moss-strong">Lessons</p>
        <h1 id="history-heading" className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.04] -tracking-[0.025em] text-balance mt-1">History</h1>
        <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-muted">Your complete lesson record. Search and filter to find past entries.</p>
      </div>
      <LessonHistory initialLessons={lessons} />
    </div>
  );
}
