function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

function parseJsonArray(text: string): string[] {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
  return parsed.map((s: unknown) => String(s).trim()).filter(Boolean);
}

export async function expandInterest(
  interestName: string,
  excludeTopics: string[] = [],
): Promise<string[]> {
  const apiKey = getApiKey();
  const model = process.env.OPENROUTER_PRIMARY_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";

  const excludeBlock = excludeTopics.length > 0
    ? `\n\nExclude these already-covered topics:\n${excludeTopics.map((t) => `- ${t}`).join("\n")}`
    : "";

  const prompt = `Break the broad topic "${interestName}" into 10-15 specific, concrete sub-topics suitable for focused 5-minute engineering lessons.${excludeBlock}

Rules:
- Return ONLY a JSON array of strings, no other text
- Each sub-topic must be a specific, narrowly-scoped concept (e.g. "B-Tree indexing" not "databases")
- Prioritize fundamental, well-established sub-topics over niche ones
- Vary the sub-topics across the full breadth of the field — do not cluster in one area
- Do NOT include any of the excluded topics listed above

Example for "database internals":
["B-Tree indexing", "LSM tree structure", "query optimization", "transaction isolation levels", "write-ahead logging", "data replication", "sharding strategies", "buffer pool management"]

Respond with valid JSON only.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert curriculum designer. Return only valid JSON arrays of strings. Never include markdown fences or explanatory text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty response from model");

  return parseJsonArray(text);
}

export function isBroadInterest(name: string): boolean {
  const broadPatterns = [
    /\b(systems?|internals?|engineering|principles|fundamentals|basics|overview|introduction|guide|theory)\b/i,
  ];
  return broadPatterns.some((p) => p.test(name));
}
