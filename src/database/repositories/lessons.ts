import { and, desc, eq, like, or } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { lessons } from "../schemas";

export async function listLessons(
  userId: string,
  options: { query?: string; status?: "unread" | "completed" | "skipped"; limit?: number } = {},
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return [];

  const filters = [eq(lessons.userId, userId)];

  if (options.status) {
    filters.push(eq(lessons.status, options.status));
  }

  if (options.query?.trim()) {
    const query = `%${options.query.trim()}%`;
    const search = or(like(lessons.title, query), like(lessons.contentMarkdown, query));
    if (search) filters.push(search);
  }

  return db
    .select()
    .from(lessons)
    .where(and(...filters))
    .orderBy(desc(lessons.generatedAt))
    .limit(Math.min(options.limit ?? 50, 100));
}

export async function getLesson(userId: string, lessonId: string, database?: Database | null) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.userId, userId), eq(lessons.id, lessonId)))
    .limit(1);
  return lesson;
}

export async function setLessonStatus(
  userId: string,
  lessonId: string,
  status: "completed" | "skipped",
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const now = new Date();
  const [lesson] = await db
    .update(lessons)
    .set({
      status,
      completedAt: status === "completed" ? now : null,
      updatedAt: now,
    })
    .where(
      and(
        eq(lessons.userId, userId),
        eq(lessons.id, lessonId),
        eq(lessons.status, "unread"),
      ),
    )
    .returning();
  return lesson;
}
