// Check workflow: asks a second model, which has not seen the measurements, what it makes of the photo.
import { join } from "node:path";

import * as describer from "../../agents/describer/main.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Step, type Task } from "../../common/make_step.ts";
import { noteSaid } from "../../common/note_said.ts";
import { pickImage } from "../../common/pick_image.ts";
import { writeStep } from "../../common/write_step.ts";
import config from "./config.json" with { type: "json" };
import { weighAnswer } from "./modules/weigh_answer.ts";

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? "image");
  const subject = String(task.step.facts.subject ?? "object");
  const asked = String(task.step.facts.prompt ?? "").trim();
  const said = await describer.run({
    image: join(task.workspace, pickImage(task.step)),
    question: asked || config.question.replace("{subject}", subject),
  });
  if (!said.allowed) {
    return makeOutcome(false, said.reason, config.workflow, kind, start);
  }
  const worth = weighAnswer(said.text ?? "", config.no_use, config.least_chars);
  const facts: Step["facts"] = { ...task.step.facts, checked: worth };
  if (!worth) {
    delete facts.checked;
    facts.not_told = config.no_help_note;
  }
  writeStep(
    join(task.workspace, config.scratchpad),
    makeStep(
      {
        task: task.step.task,
        step: task.step.step + 1,
        about: task.step.about,
        next: config.reports_to,
        from: config.workflow,
        note: worth ? config.note : config.no_help_note,
      },
      { facts, said: [noteSaid(said)] },
    ),
  );
  return makeOutcome(true, config.reason, config.workflow, kind, start);
}
