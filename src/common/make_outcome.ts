// Builds the answer every workflow returns, so they all report in the same shape.
import type { Said } from "./make_step.ts";

export type Outcome = {
  allowed: boolean;
  reason: string;
  workflow: string;
  kind: string;
  seconds: number;
  said?: Said[];
};

export function makeOutcome(
  allowed: boolean,
  reason: string,
  workflow: string,
  kind: string,
  start: number,
  said?: Said[],
): Outcome {
  return {
    allowed,
    reason,
    workflow,
    kind,
    seconds: Number(((performance.now() - start) / 1000).toFixed(4)),
    ...(said ? { said } : {}),
  };
}
