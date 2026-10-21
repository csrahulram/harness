// Guards what a session brought in. What it remembers was guarded when it arrived, and is let be.
import { readdirSync } from "node:fs";
import { join } from "node:path";

import * as guard from "../../../agents/guard/main.ts";
import { makeOutcome, type Outcome } from "../../../common/make_outcome.ts";
import { makeStep, type Said, type Step, type Task } from "../../../common/make_step.ts";
import { noteSaid } from "../../../common/note_said.ts";
import { pickJob, type Chore } from "../../../common/pick_job.ts";
import { readText } from "../../../common/read_text.ts";
import { writeStep } from "../../../common/write_step.ts";
import config from "../config.json" with { type: "json" };
import { detectType } from "./detect_type.ts";

export async function guardSession(task: Task, start: number): Promise<Outcome> {
  const folder = join(task.workspace, task.step.about);
  const files = readdirSync(folder).sort();
  const kind = config.session_kind;
  if (files.length === 0) {
    return makeOutcome(false, config.empty_session, config.workflow, kind, start);
  }
  const said: string[] = [];
  const spoke: Said[] = [];
  const facts: Step["facts"] = { ...task.step.facts, kind };
  for (const file of files) {
    const found = detectType(file, config.kinds, config.unknown_kind);
    const where = join(folder, file);
    const reads = config.reads_kinds.includes(found);
    const text = reads ? readText(where, config.max_chars) : "";
    if (file === config.history_file) {
      facts.history = text;
      said.push(`${file}, checked when it arrived`);
      continue;
    }
    const checked = await guard.run(reads ? { job: found, text } : { job: found, image: where });
    spoke.push(noteSaid(checked));
    if (!checked.allowed) {
      const why = config.blocked_as.replace("{why}", checked.reason);
      return makeOutcome(false, why, config.workflow, kind, start, spoke);
    }
    said.push(`${file} is ${found}, ok`);
    if (reads) {
      facts.prompt = text;
    }
    if (found === config.photo_kind) {
      facts.picture = `${task.step.about}/${file}`;
      facts.words_in_photo = checked.text || config.no_words;
    }
  }
  const chore = facts.picture
    ? undefined
    : pickJob(String(facts.prompt ?? ""), config.chores as Chore[]);
  if (chore?.tool) {
    facts.tool = chore.tool;
    facts.job = chore.job;
  }
  const next = facts.picture
    ? config.first_worker
    : chore
      ? (chore.goes_to ?? config.looks_up_with)
      : config.answers_with;
  writeStep(
    join(task.workspace, config.scratchpad),
    makeStep(
      {
        task: task.step.task,
        step: task.step.step + 1,
        about: task.step.about,
        next,
        from: config.workflow,
        note: facts.picture ? config.begun_note : config.said_note,
      },
      { facts, said: spoke },
    ),
  );
  return makeOutcome(true, said.join(" | "), config.workflow, kind, start);
}
