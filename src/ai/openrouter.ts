import {
  LessonGenerationError,
  type LessonProvider,
} from "./provider";
import { generatedLessonPayloadSchema } from "./schema";
import type { GeneratedLesson, LessonGenerationContext } from "./types";

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

const defaultPrimaryModel = "nvidia/nemotron-3-super-120b-a12b:free";
const defaultFallbackModel = "nvidia/nemotron-3-super-120b-a12b:free";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7,
): Promise<{ text: string; model: string }> {
  const apiKey = getApiKey();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      top_p: 0.95,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const usedModel = data.model ?? model;

  return { text, model: usedModel };
}

export const openRouterProvider: LessonProvider = {
  name: "openrouter",

  async generateLesson(context: LessonGenerationContext): Promise<GeneratedLesson> {
    const prompt = buildPrompt(context);

    async function tryModel(model: string): Promise<GeneratedLesson> {
      const { text, model: usedModel } = await callOpenRouter(
        model,
        "You are a thoughtful engineering mentor. Respond only with valid JSON. Never include markdown code fences or text outside the JSON object.",
        prompt,
        0.7,
      );

      if (!text) throw new LessonGenerationError("Empty response from model", model);

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      const payload = generatedLessonPayloadSchema.parse(parsed);

      return {
        ...payload,
        sources: [],
        model: usedModel,
      };
    }

    const errors: Array<{ model: string; error: unknown }> = [];

    for (const model of [defaultPrimaryModel, defaultFallbackModel]) {
      try {
        return await tryModel(model);
      } catch (error) {
        errors.push({ model, error });
      }
    }

    throw new LessonGenerationError(
      `All OpenRouter models failed: ${errors.map((e) => `${e.model}: ${e.error}`).join("; ")}`,
      "openrouter",
      errors,
    );
  },
};
