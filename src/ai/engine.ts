import { getDatabase, type Database } from "@/database/client";
import { listConcepts } from "@/database/repositories/concepts";
import { listInterests, touchInterests } from "@/database/repositories/interests";
import { listLessons } from "@/database/repositories/lessons";
import { getProfile } from "@/database/repositories/profile";
import { getSettings } from "@/database/repositories/settings";
import { lessonConcepts, lessons } from "@/database/schemas";

import { openRouterProvider } from "./openrouter";
import { generateLesson } from "./provider";
import { seedOrCreateConcepts } from "./progression";
import { scoreTopics, selectTopic, type ScoredTopic } from "./scoring";
import type { GeneratedLesson } from "./types";

export type DailyLessonResult = {
  lesson: (GeneratedLesson & { id: string }) | null;
  skipped: boolean;
  reason: string;
};

export async function getTodaysPlan(
  userId: string,
  excludeTopicNames: string[] = [],
  database?: Database | null,
): Promise<{ topics: ScoredTopic[]; reason: string }> {
  const db = database ?? getDatabase();

  const [profile, interests, concepts, recentLessons] = await Promise.all([
    getProfile(userId, db),
    listInterests(userId, db),
    listConcepts(userId, db),
    listLessons(userId, { status: "unread", limit: 10 }, db),
  ]);

  if (!profile) return { topics: [], reason: "Profile not found" };
  if (recentLessons.length > 0) return { topics: [], reason: "Unread lesson waiting" };
  if (interests.length === 0) return { topics: [], reason: "No interests configured" };

  const allScored = scoreTopics(interests, concepts, recentLessons.map((l) => l.title));
  const filtered = allScored.filter((t) => !excludeTopicNames.includes(t.normalizedName));
  const selected = selectTopic(filtered, 1);
  const reason = selected.length > 0
    ? selected[0].reason
    : "No topics scored high enough";

  return { topics: filtered, reason };
}

export async function generateDailyLesson(
  userId: string,
  database?: Database | null,
): Promise<DailyLessonResult> {
  const db = database ?? getDatabase();
  if (!db) {
    return { lesson: null, skipped: true, reason: "Database not configured" };
  }

  const [profile, settings, interests, concepts, recentLessons] = await Promise.all([
    getProfile(userId, db),
    getSettings(userId, db),
    listInterests(userId, db),
    listConcepts(userId, db),
    listLessons(userId, { status: "unread", limit: 10 }, db),
  ]);

  if (!profile) {
    return { lesson: null, skipped: true, reason: "Profile not found" };
  }

  if (recentLessons.length > 0) {
    return {
      lesson: null,
      skipped: true,
      reason: `${recentLessons.length} unread lesson(s) waiting. Complete or skip them before generating a new one.`,
    };
  }

  if (interests.length === 0) {
    return {
      lesson: null,
      skipped: true,
      reason: "No interests configured. Add interests in settings to generate lessons.",
    };
  }

  const scored = scoreTopics(
    interests,
    concepts,
    recentLessons.map((l) => l.title),
  );

  const selected = selectTopic(scored, 1);
  if (selected.length === 0) {
    return { lesson: null, skipped: true, reason: "No topics scored high enough to generate a lesson." };
  }

  const topic = selected[0];
  await touchInterests(userId, [topic.normalizedName], db);

  const context = {
    learner: {
      displayName: profile.displayName,
      learningGoal: profile.learningGoal,
      background: profile.background,
    },
    selectedTopic: {
      name: topic.name,
      reason: topic.reason,
      desiredDifficulty: topic.desiredDifficulty,
    },
    interests: interests.map((i) => ({ name: i.name, weight: i.weight })),
    knowledge: concepts.map((c) => ({
      name: c.name,
      knowledgeScore: c.knowledgeScore,
      confidenceScore: c.confidenceScore,
      prerequisites: [],
    })),
    recentLessons: recentLessons.map((l) => ({
      title: l.title,
      status: l.status as "unread" | "completed" | "skipped",
      generatedAt: l.generatedAt,
    })),
    targetMinutes: settings?.lessonsPerDay ?? 1,
  };

  const generated = await generateLesson(context, openRouterProvider);

  const conceptMap = await seedOrCreateConcepts(userId, generated.concepts, db);

  const slug = generated.title
    .toLocaleLowerCase("en-IN")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

  const lessonId = crypto.randomUUID();

  await db.insert(lessons).values({
    id: lessonId,
    userId,
    title: generated.title,
    slug,
    whyThisLesson: generated.whyThisLesson,
    contentMarkdown: generated.contentMarkdown,
    sources: generated.sources,
    readMinutes: generated.readMinutes,
    generatorModel: generated.model,
    selectionReason: topic.reason,
    status: "unread",
    generatedAt: new Date(),
  });

  for (const concept of generated.concepts) {
    const conceptId = conceptMap.get(
      concept.name.trim().toLocaleLowerCase("en-IN").replace(/\s+/g, " "),
    );
    if (!conceptId) continue;

    await db.insert(lessonConcepts).values({
      lessonId,
      conceptId,
      isPrimary: concept.isPrimary,
      scoreDelta: concept.suggestedKnowledgeDelta,
    });
  }

  return { lesson: { ...generated, id: lessonId }, skipped: false, reason: topic.reason };
}
