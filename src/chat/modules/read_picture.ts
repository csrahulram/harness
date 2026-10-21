// Turns a picture the browser sent into bytes, and refuses a kind the harness does not read.
export function readPicture(
  sent: { name?: string; data?: string } | undefined,
  allowed: string[],
): { ending: string; bytes: Buffer } | undefined {
  if (!sent?.data || !sent.name) {
    return undefined;
  }
  const dot = sent.name.lastIndexOf(".");
  const ending = dot < 0 ? "" : sent.name.slice(dot).toLowerCase();
  if (!allowed.includes(ending)) {
    return undefined;
  }
  const bare = sent.data.includes(",") ? sent.data.slice(sent.data.indexOf(",") + 1) : sent.data;
  return { ending, bytes: Buffer.from(bare, "base64") };
}
