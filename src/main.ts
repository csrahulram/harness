// Harness entry: watches the folders, and hands anything arriving in input to the default workflow.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "./config.json" with { type: "json" };
import { makeFolders } from "./modules/make_folders.ts";
import { reportChange } from "./modules/report_change.ts";
import { reportOutcome } from "./modules/report_outcome.ts";
import { watchFolders } from "./modules/watch_folders.ts";
import * as workflow from "./workflows/default/main.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = join(root, config.workspace);

makeFolders(workspace, config.folders);
watchFolders(workspace, config.folders, config.settle_ms, (folder, file) => {
  console.log(reportChange(folder, file));
  if (folder !== config.starts_work) {
    return;
  }
  workflow
    .run({ workspace, folder, file })
    .then((outcome) => console.log(reportOutcome(outcome)))
    .catch((trouble: unknown) => console.log(reportChange(folder, `failed: ${String(trouble)}`)));
});

console.log(`watching ${config.folders.join(", ")}; work starts from ${config.starts_work}`);
