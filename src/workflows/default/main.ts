// Default workflow: works out what arrived, guards it, thinks about it, writes the thought down.
import { join } from "node:path";

import * as guard from "../../agents/guard/main.ts";
import * as thinker from "../../agents/thinker/main.ts";
import { makeOutcome, type Outcome } from "../../modules/make_outcome.ts";
import { readText } from "../../modules/read_text.ts";
import { writeResult } from "../../modules/write_result.ts";
import config from "./config.json" with { type: "json" };
import { detectType } from "./modules/detect_type.ts";

export type Change = { workspace: string; folder: string; file: string };

export async function run(change: Change): Promise<Outcome> {
  const start = performance.now();
  const kind = detectType(change.file, config.kinds, config.unknown_kind);
  if (kind === config.unknown_kind) {
    return makeOutcome(false, config.unknown_reason, config.workflow, kind, start);
  }
  if (kind !== config.reads_kind) {
    return makeOutcome(false, `${kind} is not readable as text yet`, config.workflow, kind, start);
  }

  const text = readText(join(change.workspace, change.folder, change.file), config.max_chars);
  const guarded = await guard.run({ text });
  if (!guarded.allowed) {
    return makeOutcome(false, guarded.reason, config.workflow, kind, start);
  }

  const thought = await thinker.run({ text });
  if (!thought.allowed) {
    return makeOutcome(false, thought.reason, config.workflow, kind, start);
  }

  writeResult(join(change.workspace, config.result), change.file, thought.text ?? "");
  return makeOutcome(
    true,
    `${guarded.reason}, then ${thought.reason}`,
    config.workflow,
    kind,
    start,
  );
}
