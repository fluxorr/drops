export type WebResult = {
  title: string;
  url: string;
  description: string;
};

export type SearchResults = {
  results: WebResult[];
};

function getApiKey(): string {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error("EXA_API_KEY is not set");
  return key;
}

async function searchExa(query: string, count: number): Promise<WebResult[]> {
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      numResults: count,
      type: "auto",
      contents: {
        highlights: true,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    console.error(`[web-search] Exa responded with ${res.status}: ${body}`);
    return [];
  }

  const data = await res.json();
  const exaResults = data.results ?? [];

  return exaResults
    .filter((r: { title?: string; url?: string }) => r.title && r.url)
    .map((r: { title: string; url: string; highlights?: string[]; text?: string }) => ({
      title: r.title,
      url: r.url,
      description: r.highlights?.[0] ?? r.text?.slice(0, 300) ?? "",
    }));
}

export async function freeWebSearch(query: string, count: number = 5): Promise<SearchResults | null> {
  try {
    let results = await searchExa(query, count);

    if (results.length === 0) {
      console.log(`[web-search] First attempt empty, retrying with broader query for: "${query}"`);
      results = await searchExa(`${query} guide tutorial`, count);
    }

    return { results };
  } catch (error) {
    console.error("[web-search] Exa request failed:", error);
    return null;
  }
}
