// Reads the archived runs back, newest first, so the measure outlives a wiped workspace.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Run = {
  task: string;
  at: string;
  steps: number;
  stopped: string;
  began_at: number;
  tried: number;
  answered_by: string;
  chain: { step: number; from: string; next: string; said: { agent: string }[] }[];
};

export function readRuns(folder: string, most: number): Run[] {
  let files: string[] = [];
  try {
    files = readdirSync(folder).filter((name) => name.endsWith(".jsonl"));
  } catch {
    return [];
  }
  const runs: Run[] = [];
  for (const name of files.sort().reverse()) {
    for (const line of readFileSync(join(folder, name), "utf8").split("\n").reverse()) {
      if (!line.trim()) {
        continue;
      }
      try {
        runs.push(JSON.parse(line) as Run);
      } catch {
        continue;
      }
      if (runs.length >= most) {
        return runs;
      }
    }
  }
  return runs;
}
