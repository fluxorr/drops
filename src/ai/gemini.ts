import { GoogleGenAI } from "@google/genai";

import {
  generateLesson,
  LessonGenerationError,
  type LessonProvider,
} from "./provider";
import { generatedLessonPayloadSchema } from "./schema";
import type { GeneratedLesson, LessonGenerationContext } from "./types";
import type { LessonSource } from "@/database/schemas";

function buildPrompt(context: LessonGenerationContext): string {
  return `You are a thoughtful mentor teaching one concise lesson. The learner trusts you to choose and explain what matters next.

## Learner profile
- Name: ${context.learner.displayName}
- Goal: ${context.learner.learningGoal}
- Background: ${context.learner.background ?? "Not specified"}

## Selected topic
- Topic: ${context.selectedTopic.name}
- Why this was chosen: ${context.selectedTopic.reason}
- Desired difficulty (1-10): ${context.selectedTopic.desiredDifficulty}

## Known knowledge (concept → knowledge score / 100)
${context.knowledge.map((k) => `- ${k.name}: ${k.knowledgeScore} knowledge, ${k.confidenceScore} confidence`).join("\n")}

## Active interests
${context.interests.map((i) => `- ${i.name} (weight: ${i.weight})`).join("\n")}

## Recent lesson history
${context.recentLessons.map((l) => `- "${l.title}" (${l.status})`).join("\n")}

## Task
Generate a ${context.targetMinutes}-minute lesson on "${context.selectedTopic.name}" that builds on existing knowledge.

Respond with valid JSON only using this exact schema:
{
  "title": "string (4-120 chars, clear and specific)",
  "whyThisLesson": "string (20-320 chars explaining why this lesson follows from the learner's knowledge and interests)",
  "contentMarkdown": "string (500-12000 chars of exceptional lesson content in Markdown - comprehensive, insightful, and well-structured)",
  "readMinutes": number (3-10, integer),
  "concepts": [
    {
      "name": "string (2-100 chars)",
      "description": "string (10-300 chars)",
      "isPrimary": boolean,
      "suggestedKnowledgeDelta": number (1-10, integer)
    }
  ],
  "suggestedNextConcepts": ["string (2-100 chars)"]
}`;
}

const primaryModel = process.env.GEMINI_PRIMARY_MODEL ?? "gemini-2.0-flash";
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-1.5-pro";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

export const geminiProvider: LessonProvider = {
  name: "gemini",

  async generateLesson(context: LessonGenerationContext): Promise<GeneratedLesson> {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = buildPrompt(context);

    async function tryModel(
      model: string,
      useGrounding: boolean,
    ): Promise<GeneratedLesson> {
      const config: Record<string, unknown> = {
        systemInstruction: "You are a thoughtful engineering mentor. Respond only with valid JSON. Never include markdown code fences or text outside the JSON object.",
        temperature: 0.7,
        topP: 0.95,
      };

      if (useGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response.text;
      if (!text) throw new LessonGenerationError("Empty response from model", model);

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      const payload = generatedLessonPayloadSchema.parse(parsed);

      const sources: LessonSource[] = [];

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
              kind: "other",
            });
          }
        }
      }

      return {
        ...payload,
        sources,
        model,
      };
    }

    const errors: Array<{ model: string; error: unknown }> = [];

    for (const attempt of [
      { model: primaryModel, useGrounding: true },
      { model: primaryModel, useGrounding: false },
      { model: fallbackModel, useGrounding: true },
      { model: fallbackModel, useGrounding: false },
    ]) {
      try {
        return await tryModel(attempt.model, attempt.useGrounding);
      } catch (error) {
        errors.push({ model: attempt.model, error });
      }
    }

    throw new LessonGenerationError(
      `All Gemini models failed: ${errors.map((e) => `${e.model}: ${e.error}`).join("; ")}`,
      "gemini",
      errors,
    );
  },
};

export async function generateGeminiLesson(
  context: LessonGenerationContext,
): Promise<GeneratedLesson> {
  return generateLesson(context, geminiProvider);
}
