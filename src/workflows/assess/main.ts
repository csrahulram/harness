// Assess workflow: measures what is in the photo, and says whether it could be built from.
import { join } from "node:path";

import * as looker from "../../agents/looker/main.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Step, type Task } from "../../common/make_step.ts";
import { noteSaid } from "../../common/note_said.ts";
import { pickImage } from "../../common/pick_image.ts";
import { writeStep } from "../../common/write_step.ts";
import config from "./config.json" with { type: "json" };
import { measureSubject } from "./modules/measure_subject.ts";

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? "image");
  const image = join(task.workspace, pickImage(task.step));
  const seen = await looker.run({ image, job: config.objects_job });
  if (!seen.allowed) {
    return makeOutcome(false, seen.reason, config.workflow, kind, start, [noteSaid(seen)]);
  }
  const told = await looker.run({ image, job: config.caption_job });
  const facts: Step["facts"] = {
    ...task.step.facts,
    caption: told.text ?? "",
    ...measureSubject(seen.facts, config.limits),
  };
  writeStep(
    join(task.workspace, config.scratchpad),
    makeStep(
      {
        task: task.step.task,
        step: task.step.step + 1,
        about: task.step.about,
        next: config.reports_to,
        from: config.workflow,
        note: config.note,
      },
      { facts, said: [noteSaid(seen), noteSaid(told)] },
    ),
  );
  return makeOutcome(true, config.reason, config.workflow, kind, start);
}
