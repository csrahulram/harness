// Puts the person's own words first, and adds what was seen in their picture only as notes.
export function buildAsk(
  facts: { [name: string]: string | number | boolean },
  labels: { [name: string]: string },
  opening: { nothing: string; notes: string },
): string {
  const words = String(facts.prompt ?? "").trim() || opening.nothing;
  const notes: string[] = [];
  for (const [name, label] of Object.entries(labels)) {
    const value = String(facts[name] ?? "").trim();
    if (value) {
      notes.push(`- ${label}: ${value}`);
    }
  }
  return notes.length > 0 ? `${words}\n\n${opening.notes}\n${notes.join("\n")}` : words;
}
