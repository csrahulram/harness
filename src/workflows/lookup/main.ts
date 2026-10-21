// Lookup workflow: asks a tool, tries again more plainly if nothing came back, and guards what did.
import { join } from "node:path";

import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import { makeStep, type Said, type Step, type Task } from "../../common/make_step.ts";
import { noteSaid } from "../../common/note_said.ts";
import { writeStep } from "../../common/write_step.ts";
import * as sifter from "../../agents/sifter/main.ts";
import { pickTool } from "../../tools/pick_tool.ts";
import config from "./config.json" with { type: "json" };
import { cleanQuery } from "./modules/clean_query.ts";
import { dropStubs } from "./modules/drop_stubs.ts";
import { keepSafe } from "./modules/keep_safe.ts";
import { orderFound } from "./modules/order_found.ts";

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  const kind = String(task.step.facts.kind ?? config.workflow);
  const name = String(task.step.facts.tool ?? "");
  const tool = pickTool(name);
  if (!tool) {
    return makeOutcome(false, config.no_tool_reason, config.workflow, kind, start);
  }
  const job = String(task.step.facts.job ?? "");
  const asked = String(task.step.facts.prompt ?? "");
  const tries = [cleanQuery(asked, config.strips), asked].filter(
    (query, at, all) => query && all.indexOf(query) === at,
  );
  const spoke: Said[] = [];
  const guards = config.guards_tools.includes(name);
  let looked = "";
  let note = config.note;
  for (const query of tries) {
    const got = await tool.run({ job, query });
    spoke.push(noteSaid(got));
    if (!got.allowed) {
      continue;
    }
    looked = got.text ?? "";
    if (guards) {
      const found = dropStubs(
        JSON.parse(String(got.facts?.found ?? "[]")) as { title: string; words: string }[],
        config.least_words,
      );
      const kept = await keepSafe(
        found.map((one) => `${one.title}: ${one.words}`),
        config.guard_job,
        config.most_each,
      );
      spoke.push(...kept.said);
      if (kept.refused > 0) {
        note = config.unsafe_note;
      }
      const sorted = await sifter.run({ asked: query, pieces: kept.kept });
      spoke.push(noteSaid(sorted));
      const near = sorted.allowed
        ? (JSON.parse(String(sorted.facts?.order ?? "[]")) as { at: number; near: number }[])
        : [];
      looked = orderFound(kept.kept.length, near, config.source_weight, config.keeps)
        .map((at) => kept.kept[at] ?? "")
        .filter(Boolean)
        .join("\n\n");
    }
    if (looked.trim()) {
      break;
    }
  }
  const facts: Step["facts"] = { ...task.step.facts };
  if (looked.trim()) {
    facts.looked = looked;
  } else {
    facts.not_found = config.not_found_fact;
    note = config.not_found_note;
  }
  writeStep(
    join(task.workspace, config.scratchpad),
    makeStep(
      {
        task: task.step.task,
        step: task.step.step + 1,
        about: task.step.about,
        next: config.reports_to,
        from: config.workflow,
        note,
      },
      { facts, said: spoke },
    ),
  );
  return makeOutcome(true, `${config.reason}: ${name}`, config.workflow, kind, start);
}
