// Harness entry: watches the folders, mints a task for anything new, and passes each step on.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "./config.json" with { type: "json" };
import { closeTask } from "./common/close_task.ts";
import { findSession } from "./common/find_session.ts";
import { findWaiting } from "./common/find_waiting.ts";
import { findStep } from "./common/find_step.ts";
import { makeFolders } from "./common/make_folders.ts";
import { makeStep, type Step } from "./common/make_step.ts";
import { makeTaskId } from "./common/make_task_id.ts";
import { readStep } from "./common/read_step.ts";
import { reportChange } from "./common/report_change.ts";
import { reportOutcome } from "./common/report_outcome.ts";
import { watchFolders } from "./common/watch_folders.ts";
import { pickWorkflow } from "./workflows/pick_workflow.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = join(root, config.workspace);

function pass(step: Step): void {
  const workflow = pickWorkflow(step.next);
  if (!workflow) {
    console.log(reportChange(step.task, `no workflow is called ${step.next}`));
    return;
  }
  const scratchpad = join(workspace, config.steps_folder);
  workflow
    .run({ workspace, step })
    .then((outcome) => {
      console.log(reportOutcome(outcome));
      if (!outcome.allowed) {
        closeTask(scratchpad, step, step.next, outcome.reason);
      }
    })
    .catch((trouble: unknown) => {
      console.log(reportChange(step.task, `failed: ${String(trouble)}`));
      closeTask(scratchpad, step, step.next, String(trouble));
    });
}

function unitOf(folder: string, file: string): string {
  if (folder !== config.starts_work) {
    return file;
  }
  return findSession(file, config.session_prefix) ?? file;
}

makeFolders(workspace, config.folders);
watchFolders(
  workspace,
  config.folders,
  config.settle_ms,
  config.repeat_ms,
  unitOf,
  (folder, unit) => {
    console.log(reportChange(folder, unit));
    if (folder === config.starts_work) {
      const named = unit.startsWith(config.session_prefix);
      if (named && existsSync(join(workspace, config.steps_folder, unit))) {
        return;
      }
      pass(
        makeStep({
          task: named ? unit : makeTaskId(config.task_prefix),
          step: 0,
          about: `${folder}/${unit}`,
          next: config.first_workflow,
          from: config.watcher,
          note: config.arrived_note,
        }),
      );
      return;
    }
    if (folder !== config.steps_folder) {
      return;
    }
    if (!findStep(unit)) {
      return;
    }
    const step = readStep(join(workspace, folder, unit));
    if (!step || step.done) {
      return;
    }
    if (step.step >= config.max_steps) {
      console.log(
        reportChange(step.task, `stopped at step ${step.step}; that is as far as it goes`),
      );
      return;
    }
    pass(step);
  },
);

for (const waiting of findWaiting(
  join(workspace, config.starts_work),
  join(workspace, config.steps_folder),
  config.session_prefix,
)) {
  console.log(reportChange(config.starts_work, `${waiting} was left waiting`));
  pass(
    makeStep({
      task: waiting,
      step: 0,
      about: `${config.starts_work}/${waiting}`,
      next: config.first_workflow,
      from: config.watcher,
      note: config.arrived_note,
    }),
  );
}

console.log(`watching ${config.folders.join(", ")}; work starts from ${config.starts_work}`);
