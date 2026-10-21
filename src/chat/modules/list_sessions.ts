// Lists every session the harness has worked on, newest first, named by how the talk began.
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { readSession } from "./read_session.ts";

export type Listed = {
  session: string;
  when: number;
  prompt: string;
  turns: number;
  done: boolean;
};

export function listSessions(scratchpad: string, prefix: string, mark: string): Listed[] {
  let names: string[] = [];
  try {
    names = readdirSync(scratchpad);
  } catch {
    return [];
  }
  const seen = new Set<string>();
  for (const name of names) {
    const at = name.lastIndexOf(mark);
    if (at > 0 && name.startsWith(prefix)) {
      seen.add(name.slice(0, at));
    }
  }
  const listed: Listed[] = [];
  for (const session of seen) {
    const turns = readSession(scratchpad, session, mark);
    if (turns.length === 0) {
      continue;
    }
    const when = Math.max(...turns.map((turn) => statSync(join(scratchpad, turn.task)).mtimeMs));
    const last = turns[turns.length - 1]!;
    listed.push({
      session,
      when,
      prompt: turns[0]!.prompt,
      turns: turns.length,
      done: Boolean(last.reply || last.stopped),
    });
  }
  return listed.sort((one, two) => two.when - one.when);
}
