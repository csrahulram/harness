// Asks the model server for one answer, and says plainly when the server is not there at all.
export type Spoken = { role: string; content: string };

export async function askOllama(
  host: string,
  model: string,
  said: Spoken[],
  numPredict: number,
  keepAlive: string,
): Promise<{ content: string; thinking: string } | undefined> {
  let answer: Response;
  try {
    answer = await fetch(`${host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: said,
        stream: false,
        keep_alive: keepAlive,
        options: { num_predict: numPredict, temperature: 0 },
      }),
    });
  } catch {
    return undefined;
  }
  if (!answer.ok) {
    return undefined;
  }
  const found = (await answer.json()) as { message?: { content?: string; thinking?: string } };
  return {
    content: String(found.message?.content ?? ""),
    thinking: String(found.message?.thinking ?? ""),
  };
}
