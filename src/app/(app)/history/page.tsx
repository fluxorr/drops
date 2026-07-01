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
        <p className="label-eyebrow">Lessons</p>
        <h1 id="history-heading" className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-balance mt-1">History</h1>
        <p className="mt-2 max-w-[52ch] text-base leading-[1.7] text-muted">Your complete lesson record. Search and filter to find past entries.</p>
      </div>
      <LessonHistory initialLessons={lessons} />
    </div>
  );
}
