// Builds the record every agent returns, so they all answer in the same shape.
export type Record = {
  allowed: boolean;
  reason: string;
  agent: string;
  model: string;
  seconds: number;
  text?: string;
  score?: number;
};

export function makeRecord(
  allowed: boolean,
  reason: string,
  agent: string,
  model: string,
  start: number,
  extra: Partial<Record> = {},
): Record {
  return {
    allowed,
    reason,
    agent,
    model,
    seconds: Number(((performance.now() - start) / 1000).toFixed(3)),
    ...extra,
  };
}
