// Asks, of each check, which tool the words would actually reach, and reports the ones that go wrong.
import { pickJob, type Chore } from "../../../common/pick_job.ts";

export type Check = {
  fault: string;
  ask: string;
  wants_tool: string;
  expect: { must_match?: string; must_not_say?: string[] };
  goal: string;
  clause: string;
  file: string;
  knob: string;
};

export function runChecks(checks: Check[], chores: Chore[]): { check: Check; reached: string }[] {
  const wrong: { check: Check; reached: string }[] = [];
  for (const check of checks) {
    const chore = pickJob(check.ask, chores);
    const reached = chore?.tool ?? chore?.goes_to ?? "";
    if (reached !== check.wants_tool) {
      wrong.push({ check, reached });
    }
  }
  return wrong;
}
