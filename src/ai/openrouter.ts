import {
  LessonGenerationError,
  type LessonProvider,
} from "./provider";
import { generatedLessonPayloadSchema } from "./schema";
import type { GeneratedLesson, LessonGenerationContext } from "./types";

function buildPrompt(context: LessonGenerationContext): string {
  return `You are a senior engineer crafting a single focused lesson. The learner trusts you to pick exactly what they need to study next and teach it with clarity and depth.

## Learner
- Name: ${context.learner.displayName}
- Goal: ${context.learner.learningGoal}
- Background: ${context.learner.background ?? "Not specified"}

## Topic
- Area: ${context.selectedTopic.name}
- Why selected: ${context.selectedTopic.reason}
- Difficulty target (1-10): ${context.selectedTopic.desiredDifficulty}

## Known concepts
${context.knowledge.map((k) => `- ${k.name}: ${k.knowledgeScore}/100 knowledge, ${k.confidenceScore}/100 confidence`).join("\n")}

## Interest areas
${context.interests.map((i) => `- ${i.name}`).join("\n")}

## Recent lessons
${context.recentLessons.map((l) => `- "${l.title}" (${l.status})`).join("\n")}

## Instructions

The selected topic "${context.selectedTopic.name}" is an area of interest, not a specific lesson topic. Your job:

1. Decide on one concrete, narrowly-scoped sub-topic within this area that best fits the learner's current knowledge, recent history, and stated interests.
2. Teach that sub-topic in a ${context.targetMinutes}-minute lesson.
3. The title MUST name the specific sub-topic (e.g. "B-Tree Balancing Strategies" not "Database Internals").

### Content quality guidelines
- Start with a crisp, motivating introduction that frames why this matters
- Use concrete examples, diagrams described in words, or analogies
- Every paragraph should teach something specific — avoid filler or generalities
- For difficulty 1-4: build intuition first, avoid jargon, use simple analogies
- For difficulty 5-7: teach the core mechanism, reference prerequisites, include a worked example
- For difficulty 8-10: dive into trade-offs, edge cases, and real-world considerations
- End with a summary that connects back to the learner's broader interests
- Keep the lesson tight — every sentence should pull weight

Respond with valid JSON only using this exact schema:
{
  "title": "string (4-120 chars — name the specific sub-topic, not the broad area)",
  "whyThisLesson": "string (20-320 chars explaining why this specific sub-topic was chosen given the learner's knowledge, recent history, and interests)",
  "contentMarkdown": "string (500-12000 chars of lesson content in Markdown — well-structured with headings, examples, and clear explanations)",
  "readMinutes": number (3-10, integer),
  "concepts": [
    {
      "name": "string (2-100 chars — each concept introduced in this lesson)",
      "description": "string (10-300 chars)",
      "isPrimary": boolean,
      "suggestedKnowledgeDelta": number (1-10, integer)
    }
  ],
  "suggestedNextConcepts": ["string (2-100 chars — logical next topics for follow-up lessons)"]
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
