// Gathers everything a restart should take up again: what never started, and what stopped part-way.
import { join } from "node:path";

import { findUnfinished } from "./find_unfinished.ts";
import { findWaiting } from "./find_waiting.ts";
import { makeStep, type Step } from "./make_step.ts";

export function resumeAll(
  workspace: string,
  names: { input: string; scratchpad: string; prefix: string; workflow: string; from: string },
  notes: { arrived: string; most: number },
): Step[] {
  const input = join(workspace, names.input);
  const scratchpad = join(workspace, names.scratchpad);
  const fresh = findWaiting(input, scratchpad, names.prefix).map((waiting) =>
    makeStep({
      task: waiting,
      step: 0,
      about: `${names.input}/${waiting}`,
      next: names.workflow,
      from: names.from,
      note: notes.arrived,
    }),
  );
  return [...fresh, ...findUnfinished(scratchpad, notes.most)];
}
