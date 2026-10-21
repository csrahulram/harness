// Replays the ledger so the last word on each attempt wins, and the loop knows what already failed.
import { readFileSync } from "node:fs";

export type Noted = {
  id: string;
  verdict?: string;
  tries?: number;
  locked?: string;
  settled?: boolean;
};

export function readLedger(path: string): Map<string, Noted> {
  const known = new Map<string, Noted>();
  let lines: string[] = [];
  try {
    lines = readFileSync(path, "utf8").split("\n");
  } catch {
    return known;
  }
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    let noted: Noted;
    try {
      noted = JSON.parse(line) as Noted;
    } catch {
      continue;
    }
    if (typeof noted.id !== "string") {
      continue;
    }
    known.set(noted.id, { ...known.get(noted.id), ...noted });
  }
  return known;
}
