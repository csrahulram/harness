// Builds the file a workflow leaves behind, so the next one finds its work the same way every time.
export type Block = { name: string; role: string; chars: number; text: string };

export type Said = {
  agent: string;
  model: string;
  reason: string;
  text: string;
  seconds: number;
  sent?: Block[];
  room?: number;
};

export type Step = {
  task: string;
  step: number;
  about: string;
  next: string;
  from: string;
  done: boolean;
  note: string;
  facts: { [name: string]: string | number | boolean };
  said: Said[];
};

export type Task = { workspace: string; step: Step };

export function makeStep(
  made: { task: string; step: number; about: string; next: string; from: string; note: string },
  extra: Partial<Step> = {},
): Step {
  return { done: false, facts: {}, said: [], ...made, ...extra };
}
