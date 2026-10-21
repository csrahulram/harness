// Reads what the last turn of a session decided to carry forward, from the session's own folder.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { readSpoken, type Spoken } from "../../common/read_spoken.ts";
import { findTurns } from "./find_turns.ts";

export function readCarry(
  input: string,
  scratchpad: string,
  session: string,
  mark: string,
  file: string,
): Spoken[] {
  const turns = findTurns(scratchpad, session, mark);
  const last = turns[turns.length - 1];
  if (!last) {
    return [];
  }
  try {
    return readSpoken(readFileSync(join(input, last, file), "utf8"));
  } catch {
    return [];
  }
}
