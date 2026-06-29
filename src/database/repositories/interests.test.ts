import { describe, expect, it } from "vitest";

import { normalizeInterestName } from "./interests";

describe("normalizeInterestName", () => {
  it("trims, folds case, and collapses whitespace", () => {
    expect(normalizeInterestName("  Distributed   Systems ")).toBe("distributed systems");
  });
});
