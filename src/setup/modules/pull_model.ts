// Asks the model server to pull one model, following its progress until it is there or it fails.
export async function pullModel(host: string, model: string): Promise<string> {
  const answer = await fetch(`${host}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: true }),
  });
  if (!answer.ok || !answer.body) {
    return `${answer.status} ${answer.statusText}`;
  }
  let left = "";
  let last = "";
  for await (const piece of answer.body as unknown as AsyncIterable<Uint8Array>) {
    left += Buffer.from(piece).toString("utf8");
    const lines = left.split("\n");
    left = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }
      const said = JSON.parse(line) as { status?: string; error?: string };
      if (said.error) {
        return said.error;
      }
      if (said.status && said.status !== last) {
        last = said.status;
        process.stdout.write(`   ${said.status}\n`);
      }
    }
  }
  return "";
}
