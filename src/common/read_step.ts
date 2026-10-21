// Reads a step file back, and says nothing at all if what it finds is not one.
import { readFileSync } from "node:fs";

import type { Step } from "./make_step.ts";

export function readStep(path: string): Step | undefined {
  let found: unknown;
  try {
    found = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
  const step = found as Step;
  if (typeof step?.task !== "string" || typeof step?.step !== "number") {
    return undefined;
  }
  if (typeof step.next !== "string" || typeof step.done !== "boolean") {
    return undefined;
  }
  step.said ??= [];
  return step;
}
