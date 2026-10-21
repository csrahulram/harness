// Counts how often each named fault shows up in the runs, by matching only what config says to match.
import type { Run } from "./read_runs.ts";

export type Fault = {
  fault: string;
  sees: string;
  when: string[];
  kind: string;
  file: string;
  knob: string;
  goal: string;
  clause: string;
  weight: number;
};

export function countFaults(
  runs: Run[],
  faults: Fault[],
  top: number,
): { [fault: string]: number } {
  const seen: { [fault: string]: number } = {};
  for (const run of runs) {
    for (const fault of faults) {
      if (!matches(run, fault, top)) {
        continue;
      }
      seen[fault.fault] = (seen[fault.fault] ?? 0) + 1;
    }
  }
  return seen;
}

function matches(run: Run, fault: Fault, top: number): boolean {
  if (fault.sees === "stopped") {
    const said = run.stopped.toLowerCase();
    return said !== "" && fault.when.some((phrase) => said.includes(phrase.toLowerCase()));
  }
  if (fault.sees === "climbed") {
    return run.began_at >= 0 && run.tried > 1;
  }
  if (fault.sees === "started_high") {
    return run.began_at > 0 && run.tried === 1 && run.began_at >= top - 1;
  }
  return false;
}
