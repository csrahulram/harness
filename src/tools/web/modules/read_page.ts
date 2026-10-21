// Fetches one page that has already been judged safe, and gives back the words a person would read.
import { stripHtml } from "./strip_html.ts";

export async function readPage(
  where: URL,
  most: number,
  agent: string,
  wait: number,
): Promise<string | undefined> {
  try {
    const answer = await fetch(where, {
      headers: { "User-Agent": agent },
      signal: AbortSignal.timeout(wait),
    });
    if (!answer.ok) {
      return undefined;
    }
    const kind = answer.headers.get("content-type") ?? "";
    const body = await answer.text();
    return kind.includes("html") ? stripHtml(body, most) : body.slice(0, most);
  } catch {
    return undefined;
  }
}
