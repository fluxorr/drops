import { eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { settings, type Settings } from "../schemas";

type SettingsUpdate = Partial<
  Pick<Settings, "timeZone" | "notificationTime" | "lessonsPerDay" | "pushEnabled" | "theme">
>;

export async function getSettings(userId: string, database: Database = getDatabase()) {
  const [userSettings] = await database
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);

  return userSettings;
}

export async function updateSettings(
  userId: string,
  values: SettingsUpdate,
  database: Database = getDatabase(),
) {
  const [userSettings] = await database
    .update(settings)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(settings.userId, userId))
    .returning();

  return userSettings;
}
