import { and, eq, inArray } from "drizzle-orm";

import { getDatabase, type Database } from "@/database/client";
import { concepts, lessonConcepts, lessons } from "@/database/schemas";

export type KnowledgeDelta = {
  conceptId: string;
  conceptName: string;
  knowledgeDelta: number;
  confidenceDelta: number;
};

export function computeKnowledgeDelta(
  currentKnowledge: number,
  currentConfidence: number,
  suggestedDelta: number,
  lessonCompleted: boolean,
): { knowledgeDelta: number; confidenceDelta: number } {
  if (!lessonCompleted) return { knowledgeDelta: 0, confidenceDelta: 0 };

  const baseDelta = suggestedDelta;

  const diminishingReturns = Math.max(0, 1 - currentKnowledge / 100);
  const knowledgeDelta = Math.round(baseDelta * diminishingReturns);

  const confidenceBase = Math.round(baseDelta * 0.4);
  let confidenceDelta = confidenceBase;
  if (currentConfidence > currentKnowledge) {
    confidenceDelta = Math.round(confidenceBase * 0.5);
  }
  if (currentConfidence < currentKnowledge * 0.5) {
    confidenceDelta = Math.round(confidenceBase * 1.5);
  }

  return {
    knowledgeDelta: Math.min(knowledgeDelta, 100 - currentKnowledge),
    confidenceDelta: Math.min(confidenceDelta, 100 - currentConfidence),
  };
}

export async function applyLessonCompletion(
  userId: string,
  lessonId: string,
  database?: Database | null,
): Promise<KnowledgeDelta[]> {
  const db = database ?? getDatabase();
  if (!db) return [];

  const lesson = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!lesson || lesson.status !== "completed") return [];

  const lcRows = await db
    .select()
    .from(lessonConcepts)
    .where(eq(lessonConcepts.lessonId, lessonId));

  if (lcRows.length === 0) return [];

  const conceptIds = lcRows.map((lc) => lc.conceptId);
  const existingConcepts = await db
    .select()
    .from(concepts)
    .where(and(eq(concepts.userId, userId), inArray(concepts.id, conceptIds)));

  const conceptMap = new Map(existingConcepts.map((c) => [c.id, c]));

  const deltas: KnowledgeDelta[] = [];

  for (const lc of lcRows) {
    const existing = conceptMap.get(lc.conceptId);
    const currentKnowledge = existing?.knowledgeScore ?? 0;
    const currentConfidence = existing?.confidenceScore ?? 0;

    const { knowledgeDelta, confidenceDelta } = computeKnowledgeDelta(
      currentKnowledge,
      currentConfidence,
      lc.scoreDelta,
      true,
    );

    const newKnowledge = Math.min(100, currentKnowledge + knowledgeDelta);
    const newConfidence = Math.min(100, currentConfidence + confidenceDelta);

    await db
      .update(concepts)
      .set({
        knowledgeScore: newKnowledge,
        confidenceScore: newConfidence,
        lastLearnedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(concepts.id, lc.conceptId));

    deltas.push({
      conceptId: lc.conceptId,
      conceptName: existing?.name ?? "unknown",
      knowledgeDelta,
      confidenceDelta,
    });
  }

  return deltas;
}

export async function seedOrCreateConcepts(
  userId: string,
  lessonConceptsInput: Array<{
    name: string;
    description: string;
    isPrimary: boolean;
    suggestedKnowledgeDelta: number;
  }>,
  database?: Database | null,
): Promise<Map<string, string>> {
  const db = database ?? getDatabase();
  const nameToId = new Map<string, string>();
  if (!db) return nameToId;

  for (const concept of lessonConceptsInput) {
    const normalizedName = concept.name.trim().toLocaleLowerCase("en-IN").replace(/\s+/g, " ");

    let [existing] = await db
      .select()
      .from(concepts)
      .where(and(eq(concepts.userId, userId), eq(concepts.normalizedName, normalizedName)))
      .limit(1);

    if (!existing) {
      const [created] = await db
        .insert(concepts)
        .values({
          userId,
          name: concept.name.trim(),
          normalizedName,
          description: concept.description,
          knowledgeScore: 0,
          confidenceScore: 0,
        })
        .returning();

      existing = created;
    }

    nameToId.set(normalizedName, existing.id);
  }

  return nameToId;
}
