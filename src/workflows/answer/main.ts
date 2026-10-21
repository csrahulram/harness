// Answer workflow: turns what the person said, and whatever was seen, into a reply for them.
import { join } from "node:path";

import * as thinker from "../../agents/thinker/main.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Step, type Task } from "../../common/make_step.ts";
import { readSpoken } from "../../common/read_spoken.ts";
import { writeStep } from "../../common/write_step.ts";
import config from "./config.json" with { type: "json" };
import { buildAsk } from "./modules/build_ask.ts";
import { climbRungs } from "./modules/climb_rungs.ts";

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? config.workflow);
  const ask = buildAsk(task.step.facts, config.labels, {
    nothing: config.nothing_said,
    notes: config.notes_open,
  });
  const job = task.step.facts.picture
    ? config.picture_job
    : task.step.facts.looked || task.step.facts.not_found
      ? config.looked_job
      : config.job;
  const { record, said } = await climbRungs(
    job,
    ask,
    readSpoken(task.step.facts.history),
    thinker.settings.rungs.length,
    (config.starts_at as { [job: string]: number })[job] ?? 0,
  );
  if (!record.allowed) {
    return makeOutcome(false, record.reason, config.workflow, kind, start, said);
  }
  const facts: Step["facts"] = {
    ...task.step.facts,
    reply: record.text ?? "",
    answered_by: record.model,
    tried: said.length,
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
      { facts, said },
    ),
  );
  return makeOutcome(true, `${config.reason} on ${record.model}`, config.workflow, kind, start);
}
