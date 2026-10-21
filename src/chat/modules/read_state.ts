// Reads how far a session has got from its own step files, and the reply once there is one.
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { readStep } from "../../common/read_step.ts";

import type { Said } from "../../common/make_step.ts";

export type Doing = {
  step: number;
  from: string;
  next: string;
  note: string;
  done: boolean;
  said: Said[];
};
export type State = {
  steps: Doing[];
  reply: string;
  stopped: string;
  prompt: string;
  picture: string;
};

export function readState(scratchpad: string, session: string): State {
  const folder = join(scratchpad, session);
  let names: string[] = [];
  try {
    names = readdirSync(folder);
  } catch {
    return { steps: [], reply: "", stopped: "", prompt: "", picture: "" };
  }
  const steps: Doing[] = [];
  let reply = "";
  let stopped = "";
  let prompt = "";
  let picture = "";
  for (const name of names) {
    const step = readStep(join(folder, name));
    if (!step) {
      continue;
    }
    steps.push({
      step: step.step,
      from: step.from,
      next: step.next,
      note: step.note,
      done: step.done,
      said: step.said,
    });
    prompt ||= String(step.facts.prompt ?? "");
    picture ||= String(step.facts.picture ?? "");
    if (step.done) {
      reply = String(step.facts.reply ?? "");
      stopped = String(step.facts.stopped ?? "");
    }
  }
  steps.sort((one, two) => one.step - two.step);
  return { steps, reply, stopped, prompt, picture };
}
