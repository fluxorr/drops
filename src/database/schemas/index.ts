import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { createdAt, timestamps, updatedAt } from "./_helpers";

export type LessonSource = {
  title: string;
  url: string;
  publisher?: string;
  kind?: "official" | "specification" | "paper" | "engineering" | "discussion" | "repository" | "video" | "other";
};

export type WeeklyReflectionContent = {
  completedLessons: number;
  topTopics: string[];
  newConcepts: number;
  suggestedFocus?: string;
  narrative?: string;
};

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  displayName: text("display_name").notNull(),
  learningGoal: text("learning_goal").notNull(),
  background: text("background"),
  onboardingCompletedAt: integer("onboarding_completed_at", { mode: "timestamp_ms" }),
  ...timestamps,
});

export const settings = sqliteTable(
  "settings",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => profiles.userId, { onDelete: "cascade" })
      .notNull(),
    timeZone: text("time_zone").notNull().default("Asia/Kolkata"),
    notificationTime: text("notification_time").notNull().default("08:00"),
    lessonsPerDay: integer("lessons_per_day").notNull().default(1),
    pushEnabled: integer("push_enabled", { mode: "boolean" }).notNull().default(false),
    theme: text("theme", { enum: ["system", "light", "dark"] }).notNull().default("system"),
    weeklyReflectionDay: integer("weekly_reflection_day").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    check("settings_lessons_per_day_check", sql`${table.lessonsPerDay} between 1 and 5`),
    check("settings_weekly_day_check", sql`${table.weeklyReflectionDay} between 0 and 6`),
  ],
);

export const interests = sqliteTable(
  "interests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    userId: text("user_id")
      .references(() => profiles.userId, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    weight: integer("weight").notNull().default(70),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    lastSelectedAt: integer("last_selected_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("interests_user_normalized_name_unique").on(table.userId, table.normalizedName),
    index("interests_user_active_idx").on(table.userId, table.isActive),
    check("interests_weight_check", sql`${table.weight} between 0 and 100`),
  ],
);

export const concepts = sqliteTable(
  "concepts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    userId: text("user_id")
      .references(() => profiles.userId, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    description: text("description"),
    knowledgeScore: integer("knowledge_score").notNull().default(0),
    confidenceScore: integer("confidence_score").notNull().default(0),
    lastLearnedAt: integer("last_learned_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("concepts_user_normalized_name_unique").on(table.userId, table.normalizedName),
    index("concepts_user_knowledge_idx").on(table.userId, table.knowledgeScore),
    check("concepts_knowledge_score_check", sql`${table.knowledgeScore} between 0 and 100`),
    check("concepts_confidence_score_check", sql`${table.confidenceScore} between 0 and 100`),
  ],
);

export const conceptRelationships = sqliteTable(
  "concept_relationships",
  {
    conceptId: text("concept_id")
      .references(() => concepts.id, { onDelete: "cascade" })
      .notNull(),
    prerequisiteId: text("prerequisite_id")
      .references(() => concepts.id, { onDelete: "cascade" })
      .notNull(),
    relationship: text("relationship", { enum: ["depends_on"] }).notNull().default("depends_on"),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.conceptId, table.prerequisiteId] }),
    index("concept_relationships_prerequisite_idx").on(table.prerequisiteId),
    check("concept_relationships_not_self_check", sql`${table.conceptId} <> ${table.prerequisiteId}`),
  ],
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    userId: text("user_id")
      .references(() => profiles.userId, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    whyThisLesson: text("why_this_lesson").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    sources: text("sources", { mode: "json" }).$type<LessonSource[]>().notNull().default([]),
    readMinutes: integer("read_minutes").notNull(),
    status: text("status", { enum: ["unread", "completed", "skipped"] }).notNull().default("unread"),
    generatorModel: text("generator_model").notNull(),
    selectionReason: text("selection_reason").notNull(),
    generatedAt: integer("generated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("lessons_user_slug_unique").on(table.userId, table.slug),
    index("lessons_user_generated_idx").on(table.userId, table.generatedAt),
    index("lessons_user_status_idx").on(table.userId, table.status),
    check("lessons_read_minutes_check", sql`${table.readMinutes} between 1 and 30`),
  ],
);

export const lessonConcepts = sqliteTable(
  "lesson_concepts",
  {
    lessonId: text("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),
    conceptId: text("concept_id")
      .references(() => concepts.id, { onDelete: "cascade" })
      .notNull(),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    scoreDelta: integer("score_delta").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.lessonId, table.conceptId] }),
    index("lesson_concepts_concept_idx").on(table.conceptId),
  ],
);

export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    userId: text("user_id")
      .references(() => profiles.userId, { onDelete: "cascade" })
      .notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    lastSuccessAt: integer("last_success_at", { mode: "timestamp_ms" }),
    lastFailureAt: integer("last_failure_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("push_subscriptions_endpoint_unique").on(table.endpoint),
    index("push_subscriptions_user_idx").on(table.userId),
  ],
);

export const weeklyReflections = sqliteTable(
  "weekly_reflections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    userId: text("user_id")
      .references(() => profiles.userId, { onDelete: "cascade" })
      .notNull(),
    weekStartedAt: integer("week_started_at", { mode: "timestamp_ms" }).notNull(),
    content: text("content", { mode: "json" }).$type<WeeklyReflectionContent>().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("weekly_reflections_user_week_unique").on(table.userId, table.weekStartedAt),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type Interest = typeof interests.$inferSelect;
export type Concept = typeof concepts.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
