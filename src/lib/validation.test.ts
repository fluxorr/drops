import { describe, expect, it } from "vitest";

import { interestInputSchema, lessonStatusSchema, settingsUpdateSchema } from "./validation";

describe("API validation", () => {
  it("accepts a weighted interest", () => {
    expect(interestInputSchema.parse({ name: "Rust", weight: 85 })).toMatchObject({ weight: 85 });
  });

  it("rejects an out-of-range lesson count", () => {
    expect(settingsUpdateSchema.safeParse({ lessonsPerDay: 6 }).success).toBe(false);
  });

  it("keeps immutable lessons limited to terminal status updates", () => {
    expect(lessonStatusSchema.safeParse({ status: "completed" }).success).toBe(true);
    expect(lessonStatusSchema.safeParse({ title: "Rewrite it" }).success).toBe(false);
  });
});
