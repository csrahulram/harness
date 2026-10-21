// The text path, kept whole: guard what arrived, think about it, write the thought down.
import { join } from "node:path";

import * as guard from "../../../agents/guard/main.ts";
import * as thinker from "../../../agents/thinker/main.ts";
import { makeOutcome, type Outcome } from "../../../common/make_outcome.ts";
import type { Task } from "../../../common/make_step.ts";
import { readText } from "../../../common/read_text.ts";
import { writeResult } from "../../../common/write_result.ts";
import config from "../config.json" with { type: "json" };

export async function thinkText(task: Task, kind: string, start: number): Promise<Outcome> {
  const text = readText(join(task.workspace, task.step.about), config.max_chars);
  const guarded = await guard.run({ job: kind, text });
  if (!guarded.allowed) {
    return makeOutcome(false, guarded.reason, config.workflow, kind, start);
  }
  const thought = await thinker.run({ job: config.note_job, text, rung: config.note_rung });
  if (!thought.allowed) {
    return makeOutcome(false, thought.reason, config.workflow, kind, start);
  }
  writeResult(join(task.workspace, config.result), task.step.about, thought.text ?? "");
  return makeOutcome(
    true,
    `${guarded.reason}, then ${thought.reason}`,
    config.workflow,
    kind,
    start,
  );
}
