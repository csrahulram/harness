// Finds the picture a session came with, so the page can show it again later.
import { readdirSync } from "node:fs";
import { join } from "node:path";

export function findPicture(input: string, session: string, endings: string[]): string {
  try {
    for (const name of readdirSync(join(input, session))) {
      const dot = name.lastIndexOf(".");
      if (dot > 0 && endings.includes(name.slice(dot).toLowerCase())) {
        return join(input, session, name);
      }
    }
  } catch {
    return "";
  }
  return "";
}
