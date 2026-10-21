// Asks Wikipedia what it has on something, and brings back the opening of each article.
export type Found = { title: string; where: string; words: string };

export async function askWikipedia(
  host: string,
  query: string,
  most: number,
  agent: string,
  wait: number,
): Promise<Found[]> {
  const look = new URL(host);
  look.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: String(most),
    prop: "extracts",
    exintro: "1",
    explaintext: "1",
    format: "json",
  }).toString();
  const answer = await fetch(look, {
    headers: { "User-Agent": agent },
    signal: AbortSignal.timeout(wait),
  });
  if (!answer.ok) {
    return [];
  }
  const got = (await answer.json()) as {
    query?: { pages?: { [id: string]: { title?: string; extract?: string } } };
  };
  return Object.values(got.query?.pages ?? {})
    .filter((page) => page.title)
    .map((page) => ({
      title: String(page.title),
      where: `https://en.wikipedia.org/wiki/${encodeURIComponent(String(page.title).replace(/ /g, "_"))}`,
      words: String(page.extract ?? "").trim(),
    }));
}
