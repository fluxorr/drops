import { JSDOM } from "jsdom";

export type WebResult = {
  title: string;
  url: string;
  description: string;
};

export type SearchResults = {
  results: WebResult[];
};

export async function freeWebSearch(query: string, count: number = 5): Promise<SearchResults | null> {
  const url = new URL("https://html.duckduckgo.com/html/");
  url.searchParams.set("q", query);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Drops/1.0; +https://drops.app)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      console.error(`[web-search] DuckDuckGo responded with ${res.status}`);
      return null;
    }

    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const results: WebResult[] = [];

    for (const article of doc.querySelectorAll(".result")) {
      if (results.length >= count) break;

      const linkEl = article.querySelector(".result__a");
      const snippetEl = article.querySelector(".result__snippet");

      if (!linkEl) continue;

      const anchor = linkEl.querySelector("a");
      const title = anchor?.textContent?.trim() ?? linkEl.textContent?.trim() ?? "";
      const urlHref = anchor?.getAttribute("href") ?? "";
      const description = snippetEl?.textContent?.trim() ?? "";

      if (!title || !urlHref) continue;

      const decodedUrl = urlHref.startsWith("//")
        ? `https:${urlHref}`
        : urlHref;

      results.push({ title, url: decodedUrl, description });
    }

    return { results };
  } catch (error) {
    console.error("[web-search] Request failed:", error);
    return null;
  }
}
