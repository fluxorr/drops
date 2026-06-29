import { freeWebSearch } from "./web-search";

export type TopicPreview = {
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
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
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

    const systemPrompt = "You are a helpful research assistant helping a learner decide what to study next. Respond only with valid JSON. Never include markdown code fences or text outside the JSON object.";

    const userPrompt = `## Topic to investigate
${topicName}

## Learner context
- Goal: ${learnerGoal}
- Background: ${learnerBackground}

## Web search results for "${topicName}"
${searchContext}

Based on the search results above, provide a detailed preview of this topic. Respond with valid JSON only using this exact schema:
{
  "resources": [
    { "title": "string (article/blog title)", "url": "string (real URL from search results)", "description": "string (1 sentence summary)" }
  ],
  "prerequisites": ["string (concept or skill to know first)"],
  "whyItMatters": "string (2-3 sentences on why this topic is worth learning)",
  "difficultyAssessment": "string (1 sentence on difficulty relative to the learner's background)"
}

Include 2-3 resources with real URLs from the search results above. Keep descriptions concise.`;

    console.log(`[topic-preview] Calling OpenRouter for topic: "${topicName}"`);
    const text = await callOpenRouter(systemPrompt, userPrompt);

    if (!text) {
      console.error("[topic-preview] Empty response from OpenRouter");
      return null;
    }

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    console.log(`[topic-preview] Raw response: ${text.slice(0, 200)}`);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`[topic-preview] Error generating preview for "${topicName}":`, error);
    return null;
  }
}
