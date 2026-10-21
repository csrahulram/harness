// Turns counted faults into candidates, each naming one file, one knob and one goal.
import type { Fault } from "./count_faults.ts";

export type Candidate = {
  id: string;
  fault: string;
  kind: string;
  file: string;
  knob: string;
  goal: string;
  clause: string;
  seen: number;
  score: number;
};

export function makeCandidates(
  seen: { [fault: string]: number },
  faults: Fault[],
  least: number,
  tries: (id: string) => number,
): Candidate[] {
  const made: Candidate[] = [];
  for (const fault of faults) {
    const count = seen[fault.fault] ?? 0;
    if (count < least || fault.weight <= 0) {
      continue;
    }
    const id = fault.knob ? `${fault.fault}/${fault.file}#${fault.knob}` : `${fault.fault}/`;
    made.push({
      id,
      fault: fault.fault,
      kind: fault.kind,
      file: fault.file,
      knob: fault.knob,
      goal: fault.goal,
      clause: fault.clause,
      seen: count,
      score: (count * fault.weight) / (1 + tries(id)),
    });
  }
  return made;
}
