import { auth } from "@clerk/nextjs/server";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getProfile } from "@/database/repositories/profile";
import { listLessons } from "@/database/repositories/lessons";
import { getCurrentWeekReflection } from "@/database/repositories/reflections";
import { getTodaysPlan } from "@/ai/engine";
import { LessonReader } from "@/components/today/lesson-reader";
import { TodaysPlan } from "@/components/today/todays-plan";
import { WeeklyReflectionCard, WeeklyReflectionEmpty } from "@/components/reflection/weekly-reflection";

export const dynamic = "force-dynamic";

function getWeekStart(): Date {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  const diff = ist.getDate() - day;
  const weekStart = new Date(ist);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function isSunday(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.getDay() === 0;
}

export default async function TodayPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const profile = await getProfile(userId);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");

  const lessons = await listLessons(userId, { status: "unread", limit: 1 });

  if (lessons.length > 0) {
    return <LessonReader lesson={lessons[0]} />;
  }

  const plan = await getTodaysPlan(userId);

  if (isSunday()) {
    const weekStart = getWeekStart();
    const reflection = await getCurrentWeekReflection(userId, weekStart);
    if (reflection) {
      return (
        <>
          <TodaysPlan initialPlan={plan} profileName={profile.displayName} />
          <WeeklyReflectionCard reflection={reflection} />
        </>
      );
    }
    return <WeeklyReflectionEmpty />;
  }

  return <TodaysPlan initialPlan={plan} profileName={profile.displayName} />;
}
