import type { LessonSource } from "@/database/schemas";

export type KnowledgeContext = {
  name: string;
  knowledgeScore: number;
  confidenceScore: number;
  prerequisites: Array<{ name: string; knowledgeScore: number }>;
};

export type LessonHistoryItem = {
  title: string;
  status: "unread" | "completed" | "skipped";
  generatedAt: Date;
};

export type LessonGenerationContext = {
  learner: {
    displayName: string;
    learningGoal: string;
    background?: string | null;
  };
  selectedTopic: {
    name: string;
    reason: string;
    desiredDifficulty: number;
  };
  interests: Array<{ name: string; weight: number }>;
  knowledge: KnowledgeContext[];
  recentLessons: LessonHistoryItem[];
  targetMinutes: number;
};

export type GeneratedConcept = {
  name: string;
  description: string;
  isPrimary: boolean;
  suggestedKnowledgeDelta: number;
};

export type GeneratedLesson = {
  title: string;
  whyThisLesson: string;
  contentMarkdown: string;
  readMinutes: number;
  concepts: GeneratedConcept[];
  suggestedNextConcepts: string[];
  sources: LessonSource[];
  model: string;
};
