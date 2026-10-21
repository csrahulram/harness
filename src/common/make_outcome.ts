// Builds the answer every workflow returns, so they all report in the same shape.
export type Outcome = {
  allowed: boolean;
  reason: string;
  workflow: string;
  kind: string;
  seconds: number;
};

export function makeOutcome(
  allowed: boolean,
  reason: string,
  workflow: string,
  kind: string,
  start: number,
): Outcome {
  return {
    allowed,
    reason,
    workflow,
    kind,
    seconds: Number(((performance.now() - start) / 1000).toFixed(4)),
  };
}
