// Says in one line how a workflow answered, so the chain can be read as it runs.
import type { Outcome } from "./make_outcome.ts";

export function reportOutcome(outcome: Outcome): string {
  const at = new Date().toISOString().slice(11, 19);
  const mark = outcome.allowed ? "ok  " : "stop";
  return `${at}  ${mark} ${outcome.workflow}/${outcome.kind} ${outcome.seconds}s  ${outcome.reason}`;
}
