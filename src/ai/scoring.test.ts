import { describe, expect, it } from "vitest";

import { computeKnowledgeDelta } from "./progression";
import { scoreTopics, selectTopic } from "./scoring";
import type { Interest, Concept } from "@/database/schemas";

function makeInterest(overrides: Partial<Interest> = {}): Interest {
  return {
    id: "1",
    userId: "user-1",
    name: "Rust",
    normalizedName: "rust",
    weight: 80,
    pinned: false,
    isActive: true,
    lastSelectedAt: null,
    subtopics: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    id: "c1",
    userId: "user-1",
    name: "Rust",
    normalizedName: "rust",
    description: "Systems programming language",
    knowledgeScore: 30,
    confidenceScore: 25,
    lastLearnedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("scoreTopics", () => {
  it("returns empty when no interests", () => {
    const result = scoreTopics([], [], []);
    expect(result).toEqual([]);
  });

  it("boosts new topics with no existing concept", () => {
    const interests = [makeInterest({ weight: 50 })];
    const result = scoreTopics(interests, [], []);
    expect(result).toHaveLength(1);
    expect(result[0].score).toBeGreaterThanOrEqual(75);
  });

  it("reduces score for recently selected topics", () => {
    const recentlySelected = makeInterest({
      lastSelectedAt: new Date(Date.now() - 1000 * 60 * 60),
    });
    const result = scoreTopics([recentlySelected], [], []);
    expect(result[0].score).toBe(80 + 25 - 40);
  });

  it("penalizes topics whose name exactly matches a recent lesson title", () => {
    const interests = [makeInterest({ lastSelectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) })];
    const result = scoreTopics(interests, [], ["rust"]);
    expect(result[0].score).toBe(80 + 25 + 10 - 50);
  });

  it("boosts topics with large knowledge gaps", () => {
    const interests = [makeInterest({ lastSelectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) })];
    const concepts = [makeConcept({ knowledgeScore: 10 })];
    const result = scoreTopics(interests, concepts, []);
    const gapBoost = (100 - 10) * 0.3;
    expect(result[0].score).toBe(80 + gapBoost + 10);
  });

  it("filters out well-known concepts (>= 80 knowledge)", () => {
    const interests = [makeInterest()];
    const concepts = [makeConcept({ knowledgeScore: 85 })];
    const result = scoreTopics(interests, concepts, []);
    expect(result).toHaveLength(0);
  });

  it("excludes sub-topics that are well-known", () => {
    const interests = [makeInterest({
      subtopics: ["Borrow Checker", "Ownership"],
    })];
    const concepts = [
      makeConcept({ name: "Borrow Checker", normalizedName: "borrow checker", knowledgeScore: 90 }),
    ];
    const result = scoreTopics(interests, concepts, []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ownership");
  });

  it("expands sub-topics and scores them individually", () => {
    const interests = [makeInterest({
      name: "Rust",
      normalizedName: "rust",
      weight: 70,
      subtopics: ["Borrow Checker", "Ownership", "Lifetimes"],
    })];
    const result = scoreTopics(interests, [], []);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name).sort()).toEqual(["Borrow Checker", "Lifetimes", "Ownership"]);
  });

  it("sorts results by descending score", () => {
    const interests = [
      makeInterest({ name: "Rust", normalizedName: "rust", weight: 80 }),
      makeInterest({ name: "Python", normalizedName: "python", weight: 20 }),
    ];
    const result = scoreTopics(interests, [], []);
    expect(result[0].name).toBe("Rust");
    expect(result[1].name).toBe("Python");
  });
});

describe("selectTopic", () => {
  it("returns the requested number of topics", () => {
    const scored = [
      { name: "Python", normalizedName: "python", score: 30, reason: "test", desiredDifficulty: 5 },
      { name: "Rust", normalizedName: "rust", score: 90, reason: "test", desiredDifficulty: 7 },
    ];
    const selected = selectTopic(scored, 1);
    expect(selected).toHaveLength(1);
  });

  it("returns empty when no positive scores", () => {
    const result = selectTopic([{ name: "Unrelated", normalizedName: "unrelated", score: -10, reason: "bad", desiredDifficulty: 5 }]);
    expect(result).toHaveLength(0);
  });

  it("handles empty input", () => {
    const result = selectTopic([]);
    expect(result).toHaveLength(0);
  });
});

describe("computeKnowledgeDelta", () => {
  it("returns zero delta when lesson not completed", () => {
    const result = computeKnowledgeDelta(50, 40, 5, false);
    expect(result).toEqual({ knowledgeDelta: 0, confidenceDelta: 0 });
  });

  it("applies diminishing returns for high knowledge", () => {
    const result = computeKnowledgeDelta(90, 80, 10, true);
    expect(result.knowledgeDelta).toBeLessThan(5);
  });

  it("applies full delta for low knowledge", () => {
    const result = computeKnowledgeDelta(10, 10, 5, true);
    expect(result.knowledgeDelta).toBe(5);
  });

  it("boosts confidence when far below knowledge", () => {
    const result = computeKnowledgeDelta(60, 20, 5, true);
    expect(result.confidenceDelta).toBeGreaterThan(2);
  });

  it("never exceeds 100", () => {
    const result = computeKnowledgeDelta(99, 99, 10, true);
    expect(result.knowledgeDelta).toBeLessThanOrEqual(1);
    expect(result.confidenceDelta).toBeLessThanOrEqual(1);
  });
});
