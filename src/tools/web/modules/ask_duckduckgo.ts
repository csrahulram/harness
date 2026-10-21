// Asks DuckDuckGo for its short answer on something, and for what it says is related.
import type { Found } from "./ask_wikipedia.ts";

export async function askDuckduckgo(
  host: string,
  query: string,
  most: number,
  agent: string,
  wait: number,
): Promise<Found[]> {
  const look = new URL(host);
  look.search = new URLSearchParams({ q: query, format: "json", no_html: "1" }).toString();
  const answer = await fetch(look, {
    headers: { "User-Agent": agent },
    signal: AbortSignal.timeout(wait),
  });
  if (!answer.ok) {
    return [];
  }
  const got = (await answer.json()) as {
    AbstractText?: string;
    AbstractURL?: string;
    Heading?: string;
    RelatedTopics?: { Text?: string; FirstURL?: string }[];
  };
  const found: Found[] = [];
  if (got.AbstractText) {
    found.push({
      title: String(got.Heading ?? query),
      where: String(got.AbstractURL ?? ""),
      words: String(got.AbstractText),
    });
  }
  for (const near of got.RelatedTopics ?? []) {
    if (found.length >= most || !near.Text) {
      break;
    }
    found.push({
      title: String(near.Text).slice(0, 60),
      where: String(near.FirstURL ?? ""),
      words: String(near.Text),
    });
  }
  return found;
}
