// Harness entry: watches the folders, mints a task for anything new, and passes each step on.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "./config.json" with { type: "json" };
import { closeTask } from "./common/close_task.ts";
import { findSession } from "./common/find_session.ts";
import { makeFolders } from "./common/make_folders.ts";
import type { Step } from "./common/make_step.ts";
import { reportChange } from "./common/report_change.ts";
import { reportOutcome } from "./common/report_outcome.ts";
import { resumeAll } from "./common/resume_all.ts";
import { takeChange } from "./common/take_change.ts";
import { watchFolders } from "./common/watch_folders.ts";
import { pickWorkflow } from "./workflows/pick_workflow.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = join(root, config.workspace);
const scratchpad = join(workspace, config.steps_folder);
const names = {
  starts: config.starts_work,
  steps: config.steps_folder,
  prefix: config.session_prefix,
  workflow: config.first_workflow,
  from: config.watcher,
};
const notes = { arrived: config.arrived_note, task: config.task_prefix, most: config.max_steps };

function pass(step: Step): void {
  const workflow = pickWorkflow(step.next);
  if (!workflow) {
    console.log(reportChange(step.task, `no workflow is called ${step.next}`));
    return;
  }
  workflow
    .run({ workspace, step })
    .then((outcome) => {
      console.log(reportOutcome(outcome));
      if (!outcome.allowed) {
        closeTask(scratchpad, step, step.next, outcome.reason, outcome.said);
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
    const taken = takeChange(workspace, { folder, unit }, names, notes);
    if (taken.capped) {
      console.log(reportChange(taken.capped.task, config.capped_reason));
      closeTask(scratchpad, taken.capped, taken.capped.next, config.capped_reason);
      return;
    }
    if (taken.pass) {
      pass(taken.pass);
    }
  },
);

for (const step of resumeAll(
  workspace,
  { input: config.starts_work, scratchpad: config.steps_folder, ...names },
  notes,
)) {
  console.log(reportChange(step.task, `${step.task} was left waiting at step ${step.step}`));
  pass(step);
}

console.log(`watching ${config.folders.join(", ")}; work starts from ${config.starts_work}`);
