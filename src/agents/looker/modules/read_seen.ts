// Turns whatever the vision model answered into the plain text, or the things, that it found.
export function readSeen(
  found: unknown,
  size: number[],
): { text?: string; facts?: { [name: string]: string | number } } {
  if (typeof found === "string") {
    return { text: found.trim() };
  }
  const seen = found as { labels?: string[]; bboxes?: number[][] };
  if (!Array.isArray(seen?.labels)) {
    return { text: "" };
  }
  return {
    text: seen.labels.join(", "),
    facts: {
      labels: seen.labels.join(", "),
      boxes: JSON.stringify(seen.bboxes ?? []),
      width: size[0] ?? 0,
      height: size[1] ?? 0,
    },
  };
}
