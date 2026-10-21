// Builds the conversation so far as real turns, newest kept first, stopping when the budget is used.
import type { Turn } from "./read_session.ts";

export type Spoken = { role: string; content: string };

export function buildHistory(
  turns: Turn[],
  budget: number,
  roles: { them: string; me: string },
): { history: Spoken[]; forgot: number } {
  const kept: Spoken[] = [];
  let used = 0;
  let forgot = 0;
  for (let at = turns.length - 1; at >= 0; at -= 1) {
    const turn = turns[at]!;
    const answer = turn.reply || turn.stopped;
    if (!turn.prompt || !answer) {
      continue;
    }
    const size = turn.prompt.length + answer.length;
    if (used + size > budget) {
      forgot += 1;
      continue;
    }
    used += size;
    kept.unshift({ role: roles.me, content: answer });
    kept.unshift({ role: roles.them, content: turn.prompt });
  }
  return { history: kept, forgot };
}
