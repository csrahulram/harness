// Adds one finished thought to the result file, keeping what came before it.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function writeResult(path: string, about: string, thought: string): void {
  const at = new Date().toISOString().slice(0, 19).replace("T", " ");
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `\n[${at}] ${about}\n${thought}\n`, "utf8");
}
