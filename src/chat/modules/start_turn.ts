// Starts one turn of a session in the input folder: the words, the history, and any picture.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { nameTurn } from "./name_turn.ts";

export function startTurn(
  input: string,
  names: { prefix: string; mark: string; prompt: string; history: string },
  turn: {
    session: string;
    said: string;
    history: unknown[];
    picture?: { ending: string; bytes: Buffer };
  },
): string {
  let taken: string[] = [];
  try {
    taken = readdirSync(input);
  } catch {
    taken = [];
  }
  const session = turn.session || `${names.prefix}${Date.now().toString(36)}`;
  const task = nameTurn(session, taken, names.mark);
  const folder = join(input, task);
  mkdirSync(folder, { recursive: true });
  if (turn.picture) {
    writeFileSync(join(folder, `picture${turn.picture.ending}`), turn.picture.bytes);
  }
  if (turn.history.length > 0) {
    writeFileSync(join(folder, names.history), JSON.stringify(turn.history), "utf8");
  }
  writeFileSync(join(folder, names.prompt), `${turn.said}\n`, "utf8");
  return task;
}
