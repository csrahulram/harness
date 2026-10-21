// Finds every task that belongs to one session, oldest turn first.
import { readdirSync } from "node:fs";

export function findTurns(scratchpad: string, session: string, mark: string): string[] {
  let names: string[] = [];
  try {
    names = readdirSync(scratchpad);
  } catch {
    return [];
  }
  const mine = names.filter((name) => {
    const at = name.lastIndexOf(mark);
    return at > 0 && name.slice(0, at) === session;
  });
  return mine.sort((one, two) => {
    const n = (name: string) => Number(name.slice(name.lastIndexOf(mark) + mark.length)) || 0;
    return n(one) - n(two);
  });
}
