import { and, asc, eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { interests } from "../schemas";

export function normalizeInterestName(name: string) {
  return name.trim().toLocaleLowerCase("en-IN").replace(/\s+/g, " ");
}

export async function listInterests(userId: string, database: Database = getDatabase()) {
  return database
    .select()
    .from(interests)
    .where(and(eq(interests.userId, userId), eq(interests.isActive, true)))
    .orderBy(asc(interests.name));
}

export async function saveInterest(
  userId: string,
  value: { name: string; weight: number; pinned?: boolean },
  database: Database = getDatabase(),
) {
  const normalizedName = normalizeInterestName(value.name);
  const [interest] = await database
    .insert(interests)
    .values({
      userId,
      name: value.name.trim(),
      normalizedName,
      weight: value.weight,
      pinned: value.pinned ?? false,
    })
    .onConflictDoUpdate({
      target: [interests.userId, interests.normalizedName],
      set: {
        name: value.name.trim(),
        weight: value.weight,
        pinned: value.pinned ?? false,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning();

  return interest;
}

export async function removeInterest(
  userId: string,
  interestId: string,
  database: Database = getDatabase(),
) {
  const [interest] = await database
    .update(interests)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(interests.userId, userId), eq(interests.id, interestId)))
    .returning();

  return interest;
}
