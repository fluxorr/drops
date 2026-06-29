import { describe, expect, it } from "vitest";

import { generatedLessonPayloadSchema } from "./schema";

const validPayload = {
  title: "Why ownership prevents data races",
  whyThisLesson: "This builds on your Rust foundations before introducing shared-state concurrency.",
  contentMarkdown: "A".repeat(600),
  readMinutes: 6,
  concepts: [
    {
      name: "Ownership",
      description: "Rust's compile-time model for controlling access to values.",
      isPrimary: true,
      suggestedKnowledgeDelta: 5,
    },
  ],
  suggestedNextConcepts: ["Borrowing"],
};

describe("generatedLessonPayloadSchema", () => {
  it("accepts a concise structured lesson", () => {
    expect(generatedLessonPayloadSchema.parse(validPayload).readMinutes).toBe(6);
  });

  it("requires one primary concept", () => {
    const payload = { ...validPayload, concepts: [{ ...validPayload.concepts[0], isPrimary: false }] };
    expect(generatedLessonPayloadSchema.safeParse(payload).success).toBe(false);
  });
});
