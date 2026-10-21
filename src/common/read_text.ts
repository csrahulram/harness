// Reads a file as text, giving back nothing at all when it cannot be read.
import { readFileSync } from "node:fs";

export function readText(path: string, limit: number): string {
  try {
    return readFileSync(path, "utf8").slice(0, limit).trim();
  } catch {
    return "";
  }
}
