"use server";

import { auth } from "@clerk/nextjs/server";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { normalizeInterestName } from "@/database/repositories/interests";
import { createProfile } from "@/database/repositories/profile";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(2, "Use at least 2 characters").max(60),
  learningGoal: z.string().trim().min(10, "Tell Drops a little more about your goal").max(500),
  background: z.string().trim().max(1000).optional(),
  interests: z
    .string()
    .transform((value) =>
      [...new Set(value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean))].slice(0, 12),
    )
    .refine((items) => items.length > 0, "Add at least one interest"),
});

export type OnboardingState = {
  errors?: Partial<Record<"displayName" | "learningGoal" | "background" | "interests", string[]>>;
  message?: string;
};

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in" as Route);

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    learningGoal: formData.get("learningGoal"),
    background: formData.get("background") || undefined,
    interests: formData.get("interests"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createProfile(
      {
        userId,
        displayName: parsed.data.displayName,
        learningGoal: parsed.data.learningGoal,
        background: parsed.data.background,
      },
      parsed.data.interests.map((name) => ({
        name,
        normalizedName: normalizeInterestName(name),
        weight: 70,
      })),
    );
  } catch (error) {
    console.error("Unable to create learning profile", error);
    return { message: "Drops could not save your profile. Check the Turso connection and try again." };
  }

  redirect("/today");
}
