// Removes every turn one session left behind, and refuses any name that is not a session name.
import { rmSync } from "node:fs";
import { join } from "node:path";

import { findTurns } from "./find_turns.ts";

export function dropSession(
  workspace: string,
  folders: { input: string; scratchpad: string; output: string },
  session: string,
  names: { prefix: string; mark: string },
): boolean {
  if (!session.startsWith(names.prefix) || /[\/.]/.test(session)) {
    return false;
  }
  const scratchpad = join(workspace, folders.scratchpad);
  for (const task of findTurns(scratchpad, session, names.mark)) {
    rmSync(join(scratchpad, task), { recursive: true, force: true });
    rmSync(join(workspace, folders.input, task), { recursive: true, force: true });
    rmSync(join(workspace, folders.output, `${task}.md`), { force: true });
  }
  return true;
}
