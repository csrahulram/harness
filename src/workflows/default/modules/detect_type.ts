// Says what kind of thing a file is, from its name alone, before anything opens it.
export function detectType(file: string, kinds: Record<string, string[]>, unknown: string): string {
  const dot = file.lastIndexOf(".");
  const ending = dot < 0 ? "" : file.slice(dot).toLowerCase();
  for (const [kind, endings] of Object.entries(kinds)) {
    if (endings.includes(ending)) {
      return kind;
    }
  }
  return unknown;
}
