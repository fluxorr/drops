import { eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { interests, profiles, settings, type NewProfile } from "../schemas";

export type ProfileSetup = Pick<NewProfile, "displayName" | "learningGoal" | "background"> & {
  userId: string;
};

export async function getProfile(userId: string, database?: Database | null) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return profile;
}

export async function getProfileWithSettings(userId: string, database?: Database | null) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [result] = await db
    .select({ profile: profiles, settings })
    .from(profiles)
    .leftJoin(settings, eq(settings.userId, profiles.userId))
    .where(eq(profiles.userId, userId))
    .limit(1);
  return result;
}

export async function createProfile(
  setup: ProfileSetup,
  initialInterests: Array<{ name: string; normalizedName: string; weight: number; subtopics?: string[] | null }> = [],
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const now = new Date();
  return db.transaction(async (transaction) => {
    const [profile] = await transaction
      .insert(profiles)
      .values({
        ...setup,
        onboardingCompletedAt: now,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          displayName: setup.displayName,
          learningGoal: setup.learningGoal,
          background: setup.background,
          onboardingCompletedAt: now,
          updatedAt: now,
        },
      })
      .returning();

    await transaction
      .insert(settings)
      .values({ userId: setup.userId })
      .onConflictDoNothing({ target: settings.userId });

    if (initialInterests.length > 0) {
      await transaction
        .insert(interests)
        .values(initialInterests.map((interest) => ({ ...interest, userId: setup.userId, subtopics: interest.subtopics ?? null })))
        .onConflictDoNothing({ target: [interests.userId, interests.normalizedName] });
    }

    return profile;
  });
}

export async function updateProfile(
  userId: string,
  values: Partial<Pick<NewProfile, "displayName" | "learningGoal" | "background">>,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [profile] = await db
    .update(profiles)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
    .returning();
  return profile;
}

export async function updateProfilePreferences(
  userId: string,
  profileValues: Partial<Pick<NewProfile, "displayName" | "learningGoal" | "background">>,
  settingsValues: Partial<
    Pick<
      typeof settings.$inferInsert,
      "timeZone" | "notificationTime" | "lessonsPerDay" | "theme"
    >
  >,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const now = new Date();
  return db.transaction(async (transaction) => {
    const [profile] = await transaction
      .update(profiles)
      .set({ ...profileValues, updatedAt: now })
      .where(eq(profiles.userId, userId))
      .returning();

    const [userSettings] = await transaction
      .update(settings)
      .set({ ...settingsValues, updatedAt: now })
      .where(eq(settings.userId, userId))
      .returning();

    return { profile, settings: userSettings };
  });
}
