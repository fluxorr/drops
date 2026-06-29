"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateProfilePreferences } from "@/database/repositories/profile";

const preferencesSchema = z.object({
  displayName: z.string().trim().min(2, "Use at least 2 characters").max(60),
  learningGoal: z.string().trim().min(10, "Tell Drops a little more about your goal").max(500),
  background: z.string().trim().max(1000).optional(),
  notificationTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time"),
  lessonsPerDay: z.coerce.number().int().min(1).max(5),
  theme: z.enum(["system", "light", "dark"]),
});

export type PreferencesState = {
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export async function savePreferences(
  _previousState: PreferencesState,
  formData: FormData,
): Promise<PreferencesState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "Sign in again to save your settings." };

  const parsed = preferencesSchema.safeParse({
    displayName: formData.get("displayName"),
    learningGoal: formData.get("learningGoal"),
    background: formData.get("background") || undefined,
    notificationTime: formData.get("notificationTime"),
    lessonsPerDay: formData.get("lessonsPerDay"),
    theme: formData.get("theme"),
  });

  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateProfilePreferences(
      userId,
      {
        displayName: parsed.data.displayName,
        learningGoal: parsed.data.learningGoal,
        background: parsed.data.background,
      },
      {
        timeZone: "Asia/Kolkata",
        notificationTime: parsed.data.notificationTime,
        lessonsPerDay: parsed.data.lessonsPerDay,
        theme: parsed.data.theme,
      },
    );
  } catch (error) {
    console.error("Unable to update preferences", error);
    return { status: "error", message: "Your changes could not be saved. Please try again." };
  }

  revalidatePath("/today");
  revalidatePath("/settings");
  return { status: "success", message: "Changes saved." };
}
