// Hands back the workflow a step asked for by name, and nothing at all if there is no such name.
import type { Outcome } from "../common/make_outcome.ts";
import type { Task } from "../common/make_step.ts";
import * as answer from "./answer/main.ts";
import * as assess from "./assess/main.ts";
import * as check from "./check/main.ts";
import * as fallback from "./default/main.ts";

export type Workflow = { run: (task: Task) => Promise<Outcome> };

export function pickWorkflow(name: string): Workflow | undefined {
  const all: { [name: string]: Workflow } = { default: fallback, answer, assess, check };
  return all[name];
}
