import { and, asc, eq, inArray } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { interests } from "../schemas";

export function normalizeInterestName(name: string) {
  return name.trim().toLocaleLowerCase("en-IN").replace(/\s+/g, " ");
}

export async function listInterests(userId: string, database?: Database | null) {
  const db = database ?? getDatabase();
  if (!db) return [];

  return db
    .select()
    .from(interests)
    .where(and(eq(interests.userId, userId), eq(interests.isActive, true)))
    .orderBy(asc(interests.name));
}

export async function saveInterest(
  userId: string,
  value: { name: string; weight: number; pinned?: boolean; subtopics?: string[] | null },
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const normalizedName = normalizeInterestName(value.name);
  const [interest] = await db
    .insert(interests)
    .values({
      userId,
      name: value.name.trim(),
      normalizedName,
      weight: value.weight,
      pinned: value.pinned ?? false,
      subtopics: value.subtopics ?? null,
    })
    .onConflictDoUpdate({
      target: [interests.userId, interests.normalizedName],
      set: {
        name: value.name.trim(),
        weight: value.weight,
        pinned: value.pinned ?? false,
        isActive: true,
        subtopics: value.subtopics ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return interest;
}

export async function touchInterests(
  userId: string,
  interestNames: string[],
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db || interestNames.length === 0) return;

  const normalized = interestNames.map((n) => normalizeInterestName(n));
  await db
    .update(interests)
    .set({ lastSelectedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(interests.userId, userId), inArray(interests.normalizedName, normalized)),
    );
}

export async function removeInterest(
  userId: string,
  interestId: string,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [interest] = await db
    .update(interests)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(interests.userId, userId), eq(interests.id, interestId)))
    .returning();
  return interest;
}
