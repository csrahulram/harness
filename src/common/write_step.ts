// Writes a step into its task folder, where the watcher will see it and pass it on.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Step } from "./make_step.ts";

export function writeStep(root: string, step: Step): string {
  const folder = join(root, step.task);
  mkdirSync(folder, { recursive: true });
  const path = join(folder, `step_${step.step}.json`);
  writeFileSync(path, `${JSON.stringify(step, undefined, 2)}\n`, "utf8");
  return path;
}
