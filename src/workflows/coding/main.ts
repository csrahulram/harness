// Coding workflow: checks what the harness should be able to do, and sends the coder what it cannot.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as thinker from "../../agents/thinker/main.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Said, type Step, type Task } from "../../common/make_step.ts";
import { noteSaid } from "../../common/note_said.ts";
import type { Chore } from "../../common/pick_job.ts";
import { writeStep } from "../../common/write_step.ts";
import { pickTool } from "../../tools/pick_tool.ts";
import fallback from "../default/config.json" with { type: "json" };
import config from "./config.json" with { type: "json" };
import { buildNote } from "./modules/build_note.ts";
import type { Fault } from "./modules/count_faults.ts";
import { pickCandidate } from "./modules/pick_candidate.ts";
import { runChecks, type Check } from "./modules/run_checks.ts";
import { sayFound } from "./modules/say_found.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? config.workflow);
  const checks = JSON.parse(readFileSync(join(root, config.checks_file), "utf8")) as Check[];
  const wrong = runChecks(checks, fallback.chores as Chore[]);
  const facts: Step["facts"] = { ...task.step.facts, checked: checks.length, failed: wrong.length };
  const spoke: Said[] = [];
  const worst = wrong[0];
  if (worst) {
    const note = buildNote(worst, config.wrong_tool);
    const tool = pickTool(config.sends_with);
    const sent = await tool!.run({ job: config.send_job, text: JSON.stringify(note) });
    spoke.push(noteSaid(sent));
    facts.note = JSON.stringify(note);
    facts.sent = sent.allowed;
    facts.reply = (sent.allowed ? config.sent_reply : config.no_coder_reply)
      .replace("{checked}", String(checks.length))
      .replace("{failed}", String(wrong.length))
      .replace("{asked}", worst.check.ask)
      .replace("{reached}", worst.reached || "nothing")
      .replace("{wants}", worst.check.wants_tool);
  } else {
    const found = pickCandidate(
      root,
      { runs: config.runs_folder, ledger: config.ledger_file },
      {
        window: config.window_runs,
        least: config.least_seen,
        rungs: thinker.settings.rungs.length,
        never: config.never_touch,
        gives_up_after: config.gives_up_after,
      },
      config.faults as Fault[],
    );
    facts.measured = found.runs;
    facts.reply = sayFound(found.picked, found.runs, {
      found: config.says_found,
      report: config.says_report,
      nothing: config.says_nothing,
    });
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
        note: worst ? config.sent_note : config.nothing_note,
      },
      { facts, said: spoke },
    ),
  );
  return makeOutcome(true, config.reason, config.workflow, kind, start, spoke);
}
