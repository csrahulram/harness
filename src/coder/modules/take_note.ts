// Takes one debug note from the live harness, checks it carries what it must, and files it to work on.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Note = {
  fault: string;
  asked: string;
  got?: string;
  expect: { must_match?: string; must_not_say?: string[] };
  goal: string;
  clause?: string;
  file?: string;
  knob?: string;
};

export function takeNote(
  folder: string,
  sent: unknown,
  rules: { needs: string[]; most: number },
): { note?: Note; waiting: number; why?: string } {
  const note = sent as Note;
  const missing = rules.needs.filter((name) => !(name in (note ?? {})));
  mkdirSync(folder, { recursive: true });
  let taken: string[] = [];
  try {
    taken = readdirSync(folder).filter((name) => name.endsWith(".json"));
  } catch {
    taken = [];
  }
  if (missing.length > 0) {
    return { waiting: taken.length, why: missing.join(", ") };
  }
  if (taken.length >= rules.most) {
    return { waiting: taken.length, why: "" };
  }
  const at = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(join(folder, `note_${at}.json`), JSON.stringify(note, undefined, 2), "utf8");
  return { note, waiting: taken.length + 1 };
}
