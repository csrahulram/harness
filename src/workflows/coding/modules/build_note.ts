// Writes the debug note the coder is sent: what was asked, what it reached, and what good looks like.
import type { Check } from "./run_checks.ts";

export function buildNote(
  wrong: { check: Check; reached: string },
  got: string,
): { [name: string]: unknown } {
  return {
    fault: wrong.check.fault,
    asked: wrong.check.ask,
    got: got.replace("{reached}", wrong.reached || "nothing"),
    expect: wrong.check.expect,
    goal: wrong.check.goal,
    clause: wrong.check.clause,
    file: wrong.check.file,
    knob: wrong.check.knob,
    at: new Date().toISOString(),
  };
}
