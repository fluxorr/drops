import type { Concept, Interest } from "@/database/schemas";

export type ScoredTopic = {
  name: string;
  normalizedName: string;
  score: number;
  reason: string;
  desiredDifficulty: number;
  parentInterestName?: string;
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
  const addedSubTopics = new Set<string>();
  const wellKnownThreshold = 80;

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

    if (interest.subtopics && interest.subtopics.length > 0) {
      for (const sub of interest.subtopics) {
        const normalizedSub = sub.toLocaleLowerCase("en-IN").trim();
        if (addedSubTopics.has(normalizedSub)) continue;
        addedSubTopics.add(normalizedSub);

        const existingConcept = conceptMap.get(normalizedSub);

        if (existingConcept && existingConcept.knowledgeScore >= wellKnownThreshold) continue;

        let score = interest.weight;

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

        if (recentNormalized.has(normalizedSub)) score -= 50;

        if (!interest.pinned && interest.weight < 50) {
          score *= 0.7;
        }

        score = Math.max(0, Math.round(score));

        let desiredDifficulty = 5;
        if (existingConcept) {
          if (existingConcept.knowledgeScore < 30) desiredDifficulty = 3;
          else if (existingConcept.knowledgeScore < 60) desiredDifficulty = 5;
          else if (existingConcept.knowledgeScore < 85) desiredDifficulty = 7;
          else desiredDifficulty = 9;
        }

        scored.push({
          name: sub,
          normalizedName: normalizedSub,
          score,
          reason: buildSubTopicReason(sub, interest.name, existingConcept, desiredDifficulty),
          desiredDifficulty,
          parentInterestName: interest.normalizedName,
        });
      }
    } else {
      let score = interest.weight;

      const existingConcept = conceptMap.get(interest.normalizedName);

      if (existingConcept && existingConcept.knowledgeScore >= wellKnownThreshold) continue;

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

      const reason = buildReason(interest, existingConcept, score, relatedConcepts);

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
  }

  return scored;
}

function buildReason(
  interest: Interest,
  concept: Concept | undefined,
  score: number,
  relatedConcepts: TopicCandidate["relatedConcepts"],
): string {
  const subTopicHint = relatedConcepts.length > 0
    ? ` Related concepts: ${relatedConcepts.slice(0, 4).map(c => c.name).join(", ")}.`
    : "";

  if (!concept) {
    return `Explore "${interest.name}" — fresh area to dive into.${subTopicHint}`;
  }
  if (concept.knowledgeScore < 20) {
    return `Building foundation in "${interest.name}" (${concept.knowledgeScore}/100).${subTopicHint}`;
  }
  if (concept.knowledgeScore < 60) {
    return `Progressing in "${interest.name}" (${concept.knowledgeScore}/100).${subTopicHint}`;
  }
  return `Strong in "${interest.name}" (${concept.knowledgeScore}/100) with ${relatedConcepts.length} related concepts. Level up.${subTopicHint}`;
}

function difficultyLabel(d: number): string {
  if (d <= 3) return "Beginner";
  if (d <= 5) return "Intermediate";
  if (d <= 7) return "Advanced";
  return "Expert";
}

function buildSubTopicReason(
  subTopic: string,
  parentInterest: string,
  concept: Concept | undefined,
  desiredDifficulty: number,
): string {
  const tag = difficultyLabel(desiredDifficulty);
  if (!concept) {
    return `"${subTopic}" — new sub-topic within ${parentInterest} · ${tag}`;
  }
  if (concept.knowledgeScore < 20) {
    return `"${subTopic}" in ${parentInterest} — ${concept.knowledgeScore}/100 known, keep building · ${tag}`;
  }
  if (concept.knowledgeScore < 60) {
    return `"${subTopic}" in ${parentInterest} — ${concept.knowledgeScore}/100 known, deepen it · ${tag}`;
  }
  return `"${subTopic}" in ${parentInterest} — ${concept.knowledgeScore}/100 known, level up · ${tag}`;
}

export function selectTopic(
  scored: ScoredTopic[],
  count: number = 1,
): ScoredTopic[] {
  if (scored.length === 0) return [];

  const topTier = scored.filter((s) => s.score > 0);
  if (topTier.length === 0) return [];

  const shuffled = [...topTier].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
