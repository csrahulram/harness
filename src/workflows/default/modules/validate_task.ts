// The gate: nothing reaches the output unless the task came back with everything it needed.
import { join } from "node:path";

import { makeOutcome, type Outcome } from "../../../common/make_outcome.ts";
import { makeStep, type Task } from "../../../common/make_step.ts";
import { writeResult } from "../../../common/write_result.ts";
import { writeStep } from "../../../common/write_step.ts";
import config from "../config.json" with { type: "json" };

export function validateTask(task: Task, start: number): Outcome {
  const facts = task.step.facts;
  const kind = String(facts.kind ?? config.unknown_kind);
  const missing = config.needs.filter((name) => !(name in facts));
  if (missing.length > 0) {
    const reason = `${config.short_reason}: ${missing.join(", ")}`;
    return makeOutcome(false, reason, config.workflow, kind, start);
  }
  const lines = [String(facts.reply ?? ""), "", config.working_out];
  for (const [name, value] of Object.entries(facts)) {
    if (name !== "reply") {
      lines.push(`- ${name}: ${String(value)}`);
    }
  }
  const report = join(task.workspace, config.report, `${task.step.task}.md`);
  writeResult(report, task.step.about, lines.join("\n"));
  writeStep(
    join(task.workspace, config.scratchpad),
    makeStep(
      {
        task: task.step.task,
        step: task.step.step + 1,
        about: task.step.about,
        next: config.workflow,
        from: config.workflow,
        note: config.closed_note,
      },
      { done: true, facts },
    ),
  );
  return makeOutcome(true, config.published_reason, config.workflow, kind, start);
}
