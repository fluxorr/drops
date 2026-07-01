import { freeWebSearch } from "./web-search";

export type TopicPreview = {
  subTopics: string[];
  resources: Array<{ title: string; url: string; description: string }>;
  prerequisites: string[];
  whyItMatters: string;
  difficultyAssessment: string;
};

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = getApiKey();
  const model = process.env.OPENROUTER_PRIMARY_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";

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
      temperature: 0.5,
      top_p: 0.9,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function repairTruncatedJson(s: string): string {
  let fixed = s.trim().replace(/,\s*$/, "");
  const hasQuote = (fixed.match(/"/g) || []).length;
  if (hasQuote % 2 !== 0) fixed += '"';
  const openCurlies = (fixed.match(/\{/g) || []).length;
  const closeCurlies = (fixed.match(/\}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  fixed += "}".repeat(Math.max(0, openCurlies - closeCurlies));
  fixed += "]".repeat(Math.max(0, openBrackets - closeBrackets));
  return fixed;
}

function parsePreview(text: string): TopicPreview {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const repaired = repairTruncatedJson(cleaned);
    try {
      parsed = JSON.parse(repaired);
    } catch {
      console.error("[topic-preview] Failed to parse JSON after repair");
      parsed = {};
    }
  }

  return {
    subTopics: Array.isArray(parsed.subTopics) ? parsed.subTopics : [],
    resources: Array.isArray(parsed.resources) ? parsed.resources : [],
    prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [],
    whyItMatters: typeof parsed.whyItMatters === "string" ? parsed.whyItMatters : "",
    difficultyAssessment: typeof parsed.difficultyAssessment === "string" ? parsed.difficultyAssessment : "",
  };
}

export async function previewTopic(
  topicName: string,
  learnerGoal: string,
  learnerBackground: string,
): Promise<TopicPreview | null> {
  try {
    console.log(`[topic-preview] Searching web for topic: "${topicName}"`);
    const searchResults = await freeWebSearch(topicName, 5);

    const searchContext = searchResults?.results?.length
      ? searchResults.results.map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.description}`).join("\n\n")
      : "No search results found.";

    const systemPrompt = "You are a senior engineer and technical educator. Analyze topics with depth and precision. Respond only with valid JSON. Never include markdown code fences or text outside the JSON object.";

    const userPrompt = `## Topic
${topicName}

## Learner
- Goal: ${learnerGoal}
- Background: ${learnerBackground}

## Web search results for context
${searchContext}

This topic is one sub-topic within a broader domain a learner is exploring. Provide a concise, actionable preview.

Respond with valid JSON only using this exact schema:
{
  "subTopics": ["2-3 specific, narrower sub-topics within this area that would make good follow-up lessons"],
  "resources": [
    { "title": "string", "url": "string (real URL from search results)", "description": "string (1 sentence)" }
  ],
  "prerequisites": ["1-2 concepts or skills the learner should understand first"],
  "whyItMatters": "string (1-2 sentences on practical relevance, what this enables the learner to do, or why engineers invest time here)",
  "difficultyAssessment": "string (1 sentence rating difficulty relative to the learner's background and what makes it challenging)"
}

Requirements:
- subTopics must be concrete, well-known sub-areas (not fabrications)
- resources should be real, high-quality links from the search results above
- whyItMatters should be specific and practical, not generic praise
- difficultyAssessment should reference specific aspects (e.g. "requires understanding of x")`;

    console.log(`[topic-preview] Calling OpenRouter for topic: "${topicName}"`);
    const text = await callOpenRouter(systemPrompt, userPrompt);

    if (!text) {
      console.error("[topic-preview] Empty response from OpenRouter");
      return null;
    }

    console.log(`[topic-preview] Raw response: ${text.slice(0, 200)}`);
    return parsePreview(text);
  } catch (error) {
    console.error(`[topic-preview] Error generating preview for "${topicName}":`, error);
    return null;
  }
}
