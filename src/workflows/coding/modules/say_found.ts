// Writes, in code and never by a model, the one line the person reads about what was found.
import type { Candidate } from "./make_candidates.ts";

export function sayFound(
  top: Candidate | undefined,
  runs: number,
  says: { found: string; report: string; nothing: string },
): string {
  if (!top) {
    return says.nothing.replace("{runs}", String(runs));
  }
  const shape = top.kind === "report" ? says.report : says.found;
  return shape
    .replace("{runs}", String(runs))
    .replace("{fault}", top.fault)
    .replace("{goal}", top.goal)
    .replace("{file}", top.file)
    .replace("{knob}", top.knob)
    .replace("{seen}", String(top.seen));
}
