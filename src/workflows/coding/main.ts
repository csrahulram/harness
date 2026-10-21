// Coding workflow: reads what the harness measured about itself and names one thing worth changing.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as thinker from "../../agents/thinker/main.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Step, type Task } from "../../common/make_step.ts";
import { writeStep } from "../../common/write_step.ts";
import config from "./config.json" with { type: "json" };
import { countFaults, type Fault } from "./modules/count_faults.ts";
import { makeCandidates } from "./modules/make_candidates.ts";
import { rankCandidates } from "./modules/rank_candidates.ts";
import { readLedger } from "./modules/read_ledger.ts";
import { readRuns } from "./modules/read_runs.ts";
import { sayFound } from "./modules/say_found.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? config.workflow);
  const faults = config.faults as Fault[];
  const runs = readRuns(join(root, config.runs_folder), config.window_runs);
  const known = readLedger(join(root, config.ledger_file));
  const made = makeCandidates(
    countFaults(runs, faults, thinker.settings.rungs.length),
    faults,
    config.least_seen,
    (id) => known.get(id)?.tries ?? 0,
  );
  const ranked = rankCandidates(made, known, {
    never: config.never_touch,
    gives_up_after: config.gives_up_after,
  });
  const picked = ranked[0];
  const facts: Step["facts"] = {
    ...task.step.facts,
    measured: runs.length,
    reply: sayFound(picked, runs.length, {
      found: config.says_found,
      report: config.says_report,
      nothing: config.says_nothing,
    }),
  };
  if (picked) {
    facts.candidate = JSON.stringify(picked);
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
        note: picked ? config.found_note : config.nothing_note,
      },
      { facts },
    ),
  );
  return Promise.resolve(
    makeOutcome(true, picked ? config.reason : config.nothing_reason, config.workflow, kind, start),
  );
}
