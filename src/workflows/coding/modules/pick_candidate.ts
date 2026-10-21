// Reads the archived runs and the ledger, and hands back the one measured thing most worth trying.
import { join } from "node:path";

import { countFaults, type Fault } from "./count_faults.ts";
import { makeCandidates, type Candidate } from "./make_candidates.ts";
import { rankCandidates } from "./rank_candidates.ts";
import { readLedger } from "./read_ledger.ts";
import { readRuns } from "./read_runs.ts";

export function pickCandidate(
  root: string,
  where: { runs: string; ledger: string },
  rules: { window: number; least: number; rungs: number; never: string[]; gives_up_after: number },
  faults: Fault[],
): { picked?: Candidate; runs: number } {
  const runs = readRuns(join(root, where.runs), rules.window);
  const known = readLedger(join(root, where.ledger));
  const made = makeCandidates(
    countFaults(runs, faults, rules.rungs),
    faults,
    rules.least,
    (id) => known.get(id)?.tries ?? 0,
  );
  const ranked = rankCandidates(made, known, {
    never: rules.never,
    gives_up_after: rules.gives_up_after,
  });
  return { picked: ranked[0], runs: runs.length };
}
