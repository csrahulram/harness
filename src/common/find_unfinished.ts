// Finds a chain that stopped part-way through, so a restart picks it up instead of losing it.
import { readdirSync } from "node:fs";
import { join } from "node:path";

import type { Step } from "./make_step.ts";
import { readStep } from "./read_step.ts";

export function findUnfinished(scratchpad: string, most: number): Step[] {
  let tasks: string[] = [];
  try {
    tasks = readdirSync(scratchpad);
  } catch {
    return [];
  }
  const left: Step[] = [];
  for (const task of tasks) {
    let files: string[] = [];
    try {
      files = readdirSync(join(scratchpad, task));
    } catch {
      continue;
    }
    const steps = files
      .filter((name) => /^step_\d+\.json$/.test(name))
      .map((name) => Number(name.slice(5, -5)))
      .sort((one, two) => two - one);
    const last = steps[0];
    if (last === undefined) {
      continue;
    }
    const step = readStep(join(scratchpad, task, `step_${last}.json`));
    if (step && !step.done && step.step < most) {
      left.push(step);
    }
  }
  return left;
}
