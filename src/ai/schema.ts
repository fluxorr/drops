import { z } from "zod";

export const generatedLessonPayloadSchema = z.object({
  title: z.string().trim().min(4).max(120),
  whyThisLesson: z.string().trim().min(20).max(320),
  contentMarkdown: z.string().trim().min(500).max(12000),
  readMinutes: z.number().int().min(3).max(10),
  concepts: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(100),
        description: z.string().trim().min(10).max(300),
        isPrimary: z.boolean(),
        suggestedKnowledgeDelta: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(8)
    .refine((concepts) => concepts.some((concept) => concept.isPrimary), "One concept must be primary"),
  suggestedNextConcepts: z.array(z.string().trim().min(2).max(100)).max(6).default([]),
});

export type GeneratedLessonPayload = z.infer<typeof generatedLessonPayloadSchema>;
