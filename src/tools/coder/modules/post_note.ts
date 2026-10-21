// Puts one note to the coder over http, and says plainly when the coder is not there at all.
export async function postNote(
  url: string,
  note: string,
  waitMs: number,
): Promise<{ code: number; said: string } | undefined> {
  let answer: Response;
  try {
    answer = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: note,
      signal: AbortSignal.timeout(waitMs),
    });
  } catch {
    return undefined;
  }
  return { code: answer.status, said: (await answer.text()).slice(0, 400) };
}
