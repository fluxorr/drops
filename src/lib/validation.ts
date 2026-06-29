import { z } from "zod";

export const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(60).optional(),
    learningGoal: z.string().trim().min(10).max(500).optional(),
    background: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const interestInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  weight: z.number().int().min(0).max(100).default(70),
  pinned: z.boolean().optional().default(false),
});

export const settingsUpdateSchema = z
  .object({
    timeZone: z.literal("Asia/Kolkata").optional(),
    notificationTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    lessonsPerDay: z.number().int().min(1).max(5).optional(),
    pushEnabled: z.boolean().optional(),
    theme: z.enum(["system", "light", "dark"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const lessonStatusSchema = z.object({
  status: z.enum(["completed", "skipped"]),
});
