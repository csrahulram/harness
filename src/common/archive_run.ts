// Keeps one line about a finished chain outside the workspace, so wiping it does not lose the measure.
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "../config.json" with { type: "json" };
import { readStep } from "./read_step.ts";
import type { Step } from "./make_step.ts";

export function archiveRun(scratchpad: string, last: Step): void {
  const at = new Date();
  const path = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    config.runs_folder,
    `${at.getFullYear()}_${String(at.getMonth() + 1).padStart(2, "0")}.jsonl`,
  );
  try {
    if (readFileSync(path, "utf8").includes(`"task":"${last.task}"`)) {
      return;
    }
  } catch {
    mkdirSync(dirname(path), { recursive: true });
  }
  const chain = [];
  for (let step = 1; step <= last.step; step += 1) {
    const found = readStep(join(scratchpad, last.task, `step_${step}.json`));
    if (found) {
      chain.push({
        step: found.step,
        from: found.from,
        next: found.next,
        facts_chars: JSON.stringify(found.facts).length,
        said: found.said.map((one) => ({
          agent: one.agent,
          model: one.model,
          reason: one.reason,
          seconds: one.seconds,
        })),
      });
    }
  }
  const run = {
    task: last.task,
    at: at.toISOString(),
    steps: last.step,
    kind: String(last.facts.kind ?? ""),
    stopped: String(last.facts.stopped ?? ""),
    began_at: Number(last.facts.began_at ?? -1),
    tried: Number(last.facts.tried ?? 0),
    answered_by: String(last.facts.answered_by ?? ""),
    chain,
  };
  appendFileSync(path, `${JSON.stringify(run)}\n`, "utf8");
}
