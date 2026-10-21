// Says which file in a task is the picture, whether the task is one photo or a whole session.
import type { Step } from "./make_step.ts";

export function pickImage(step: Step): string {
  return String(step.facts.picture ?? step.about);
}
