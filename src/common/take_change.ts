// Decides what a change in a watched folder means: new work, a step to pass on, or nothing.
import { existsSync } from "node:fs";
import { join } from "node:path";

import { findStep } from "./find_step.ts";
import { makeStep, type Step } from "./make_step.ts";
import { makeTaskId } from "./make_task_id.ts";
import { readStep } from "./read_step.ts";

export function takeChange(
  workspace: string,
  where: { folder: string; unit: string },
  names: { starts: string; steps: string; prefix: string; workflow: string; from: string },
  notes: { arrived: string; task: string; most: number },
): { pass?: Step; capped?: Step } {
  if (where.folder === names.starts) {
    const named = where.unit.startsWith(names.prefix);
    if (named && existsSync(join(workspace, names.steps, where.unit))) {
      return {};
    }
    return {
      pass: makeStep({
        task: named ? where.unit : makeTaskId(notes.task),
        step: 0,
        about: `${where.folder}/${where.unit}`,
        next: names.workflow,
        from: names.from,
        note: notes.arrived,
      }),
    };
  }
  if (where.folder !== names.steps || !findStep(where.unit)) {
    return {};
  }
  const step = readStep(join(workspace, where.folder, where.unit));
  if (!step || step.done) {
    return {};
  }
  return step.step >= notes.most ? { capped: step } : { pass: step };
}
