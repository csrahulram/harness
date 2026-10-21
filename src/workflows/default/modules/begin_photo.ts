// Opens a photo task: lets the guard look the picture over, then asks the first worker to work.
import { join } from "node:path";

import * as guard from "../../../agents/guard/main.ts";
import { makeOutcome, type Outcome } from "../../../common/make_outcome.ts";
import { makeStep, type Step, type Task } from "../../../common/make_step.ts";
import { writeStep } from "../../../common/write_step.ts";
import config from "../config.json" with { type: "json" };

export async function beginPhoto(task: Task, kind: string, start: number): Promise<Outcome> {
  const image = join(task.workspace, task.step.about);
  const checked = await guard.run({ job: kind, image });
  if (!checked.allowed) {
    return makeOutcome(false, checked.reason, config.workflow, kind, start);
  }
  const facts: Step["facts"] = {
    ...task.step.facts,
    kind,
    words_in_photo: checked.text || config.no_words,
  };
  writeStep(
    join(task.workspace, config.scratchpad),
    makeStep(
      {
        task: task.step.task,
        step: task.step.step + 1,
        about: task.step.about,
        next: config.first_worker,
        from: config.workflow,
        note: config.begun_note,
      },
      { facts },
    ),
  );
  return makeOutcome(true, config.begun_reason, config.workflow, kind, start);
}
