// Optimise workflow: after every reply, works out what this talk should carry into the next turn.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import * as thinker from "../../agents/thinker/main.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Said, type Step, type Task } from "../../common/make_step.ts";
import { noteSaid } from "../../common/note_said.ts";
import { readSpoken } from "../../common/read_spoken.ts";
import { writeStep } from "../../common/write_step.ts";
import config from "./config.json" with { type: "json" };
import { splitTalk, type Spoken } from "./modules/split_talk.ts";

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? config.workflow);
  const talk: Spoken[] = [
    ...readSpoken(task.step.facts.history),
    { role: "user", content: String(task.step.facts.prompt ?? "") },
    { role: config.recap_role, content: String(task.step.facts.reply ?? "") },
  ].filter((said) => said.content.trim());
  const { older, newest, chars } = splitTalk(talk, config.most_chars, config.keeps_part);
  const spoke: Said[] = [];
  let carry = newest;
  let note = config.kept_note;
  let why = config.kept_reason;
  if (older.length > 0) {
    const said = await thinker.run({
      job: config.job,
      text: older.map((one) => `${one.role}: ${one.content}`).join("\n"),
      rung: config.rung,
    });
    spoke.push(noteSaid(said));
    note = config.cut_note;
    why = said.allowed ? config.cut_reason : config.no_recap_reason;
    if (said.allowed && said.text) {
      carry = [
        { role: config.recap_role, content: `${config.recap_opens} ${said.text}` },
        ...newest,
      ];
    }
  }
  const folder = join(task.workspace, config.input, task.step.task);
  mkdirSync(folder, { recursive: true });
  if (existsSync(folder)) {
    writeFileSync(join(folder, config.carry_file), JSON.stringify(carry), "utf8");
  }
  const facts: Step["facts"] = {
    ...task.step.facts,
    talk_chars: chars,
    carried: carry.reduce((all, said) => all + said.content.length, 0),
    trimmed: older.length,
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
        note,
      },
      { facts, said: spoke },
    ),
  );
  return makeOutcome(true, why, config.workflow, kind, start);
}
