import type { Concept, Interest } from "@/database/schemas";

export type ScoredTopic = {
  name: string;
  normalizedName: string;
  score: number;
  reason: string;
  desiredDifficulty: number;
};

export type TopicCandidate = {
  name: string;
  normalizedName: string;
  weight: number;
  pinned: boolean;
  lastSelectedAt: Date | null;
  relatedConcepts: Array<{
    name: string;
    knowledgeScore: number;
    confidenceScore: number;
  }>;
};

export function scoreTopics(
  interests: Interest[],
  concepts: Concept[],
  recentLessonTitles: string[],
): ScoredTopic[] {
  if (interests.length === 0) return [];

  const recentNormalized = new Set(
    recentLessonTitles.map((t) => t.toLocaleLowerCase("en-IN").trim()),
  );

  const conceptMap = new Map<string, Concept>();
  for (const c of concepts) {
    conceptMap.set(c.normalizedName, c);
  }

  const scored: ScoredTopic[] = [];

  for (const interest of interests) {
    const interestUpper = interest.name.toLocaleLowerCase("en-IN");
    const relatedConcepts: TopicCandidate["relatedConcepts"] = [];

    for (const c of concepts) {
      if (c.normalizedName.includes(interestUpper) || interestUpper.includes(c.normalizedName)) {
        relatedConcepts.push({
          name: c.name,
          knowledgeScore: c.knowledgeScore,
          confidenceScore: c.confidenceScore,
        });
      }
    }

    let score = interest.weight;

    const existingConcept = conceptMap.get(interest.normalizedName);
    if (existingConcept) {
      const knowledgeGap = 100 - existingConcept.knowledgeScore;
      score += knowledgeGap * 0.3;
    } else {
      score += 25;
    }

    const daysSinceLastSelect = interest.lastSelectedAt
      ? (Date.now() - interest.lastSelectedAt.getTime()) / (1000 * 60 * 60 * 24)
      : 30;

    if (daysSinceLastSelect < 1) score -= 40;
    else if (daysSinceLastSelect < 3) score -= 20;
    else if (daysSinceLastSelect > 14) score += 10;

    if (recentNormalized.has(interest.normalizedName)) score -= 50;

    if (!interest.pinned && interest.weight < 50) {
      score *= 0.7;
    }

    score = Math.max(0, Math.round(score));

    const reason = buildReason(interest, existingConcept, score, relatedConcepts.length);

    let desiredDifficulty = 5;
    if (existingConcept) {
      if (existingConcept.knowledgeScore < 30) desiredDifficulty = 3;
      else if (existingConcept.knowledgeScore < 60) desiredDifficulty = 5;
      else if (existingConcept.knowledgeScore < 85) desiredDifficulty = 7;
      else desiredDifficulty = 9;
    }

    scored.push({
      name: interest.name,
      normalizedName: interest.normalizedName,
      score,
      reason,
      desiredDifficulty,
    });
  }

  return scored.sort((a, b) => b.score - a.score);
}

function buildReason(
  interest: Interest,
  concept: Concept | undefined,
  score: number,
  relatedCount: number,
): string {
  if (!concept) {
    return `New topic "${interest.name}" with no existing knowledge — a fresh area to explore`;
  }
  if (concept.knowledgeScore < 20) {
    return `You have basic awareness of "${interest.name}" (${concept.knowledgeScore}/100). Time to build a solid foundation.`;
  }
  if (concept.knowledgeScore < 60) {
    return `You have intermediate knowledge of "${interest.name}" (${concept.knowledgeScore}/100). Deepen your understanding.`;
  }
  return `You know "${interest.name}" well (${concept.knowledgeScore}/100) with ${relatedCount} related concepts. Level up with advanced material.`;
}

export function selectTopic(
  scored: ScoredTopic[],
  count: number = 1,
): ScoredTopic[] {
  if (scored.length === 0) return [];

  const topTier = scored.filter((s) => s.score > 0);
  if (topTier.length === 0) return [];

  const sorted = [...topTier].sort((a, b) => {
    const diff = b.score - a.score;
    if (Math.abs(diff) < 10) return Math.random() - 0.5;
    return diff;
  });

  return sorted.slice(0, count);
}
