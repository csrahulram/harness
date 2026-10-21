// Gathers every turn of one session, so a whole conversation can be shown or carried forward.
import { findTurns } from "./find_turns.ts";
import { readState, type State } from "./read_state.ts";

export type Turn = State & { task: string };

export function readSession(scratchpad: string, session: string, mark: string): Turn[] {
  return findTurns(scratchpad, session, mark).map((task) => ({
    task,
    ...readState(scratchpad, task),
  }));
}
