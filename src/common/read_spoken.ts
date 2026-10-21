// Reads back the turns that came before, and gives nothing at all if they cannot be read.
export type Spoken = { role: string; content: string };

export function readSpoken(written: unknown): Spoken[] {
  if (typeof written !== "string" || !written.trim()) {
    return [];
  }
  let found: unknown;
  try {
    found = JSON.parse(written);
  } catch {
    return [];
  }
  if (!Array.isArray(found)) {
    return [];
  }
  return found.filter(
    (said): said is Spoken =>
      typeof (said as Spoken)?.role === "string" && typeof (said as Spoken)?.content === "string",
  );
}
