// Default workflow: starts every task, and is the only one allowed to publish a finished one.
import { existsSync } from "node:fs";
import { join } from "node:path";

import { isFolder } from "../../common/is_folder.ts";
import { makeOutcome, type Outcome } from "../../common/make_outcome.ts";
import type { Task } from "../../common/make_step.ts";
import config from "./config.json" with { type: "json" };
import { beginPhoto } from "./modules/begin_photo.ts";
import { detectType } from "./modules/detect_type.ts";
import { guardSession } from "./modules/guard_session.ts";
import { thinkText } from "./modules/think_text.ts";
import { validateTask } from "./modules/validate_task.ts";

export async function run(task: Task): Promise<Outcome> {
  const start = performance.now();
  if (task.step.step > 0) {
    return validateTask(task, start);
  }
  const where = join(task.workspace, task.step.about);
  if (isFolder(where)) {
    return guardSession(task, start);
  }
  if (!existsSync(where)) {
    return makeOutcome(false, config.gone_reason, config.workflow, config.unknown_kind, start);
  }
  const kind = detectType(task.step.about, config.kinds, config.unknown_kind);
  if (kind === config.reads_kind) {
    return thinkText(task, kind, start);
  }
  if (kind === config.photo_kind) {
    return beginPhoto(task, kind, start);
  }
  return makeOutcome(false, config.unknown_reason, config.workflow, kind, start);
}
