import { and, desc, eq, gte, lt } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { weeklyReflections } from "../schemas";
import type { WeeklyReflectionContent } from "../schemas";

export async function getLatestReflection(
  userId: string,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [reflection] = await db
    .select()
    .from(weeklyReflections)
    .where(eq(weeklyReflections.userId, userId))
    .orderBy(desc(weeklyReflections.weekStartedAt))
    .limit(1);
  return reflection ?? null;
}

export async function saveReflection(
  userId: string,
  weekStartedAt: Date,
  content: WeeklyReflectionContent,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [reflection] = await db
    .insert(weeklyReflections)
    .values({ userId, weekStartedAt, content })
    .onConflictDoUpdate({
      target: [weeklyReflections.userId, weeklyReflections.weekStartedAt],
      set: { content },
    })
    .returning();
  return reflection;
}

export async function getCurrentWeekReflection(
  userId: string,
  weekStart: Date,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [reflection] = await db
    .select()
    .from(weeklyReflections)
    .where(
      and(
        eq(weeklyReflections.userId, userId),
        gte(weeklyReflections.weekStartedAt, weekStart),
        lt(weeklyReflections.weekStartedAt, weekEnd),
      ),
    )
    .limit(1);
  return reflection ?? null;
}
