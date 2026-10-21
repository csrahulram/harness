// Finds work that arrived while nothing was watching, so a restart does not lose it.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function findWaiting(input: string, scratchpad: string, prefix: string): string[] {
  let names: string[] = [];
  try {
    names = readdirSync(input);
  } catch {
    return [];
  }
  return names.filter((name) => name.startsWith(prefix) && !existsSync(join(scratchpad, name)));
}
