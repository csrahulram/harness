// Init: fetches the weights the harness loads itself, and pulls the models the server will serve.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "./config.json" with { type: "json" };
import { fetchFile } from "./modules/fetch_file.ts";
import { pullModel } from "./modules/pull_model.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const folder = join(root, config.folder);

let missed = 0;
for (const model of config.models) {
  const wanted = model.files.filter((file) => !existsSync(join(folder, model.folder, file)));
  if (wanted.length === 0) {
    console.log(`${model.folder.padEnd(38)} ${config.have}`);
    continue;
  }
  console.log(
    `${model.folder.padEnd(38)} ${config.getting} ${wanted.length} of ${model.files.length}`,
  );
  for (const file of wanted) {
    try {
      await fetchFile(
        `${config.host}/${model.from}/resolve/main/${file}`,
        join(folder, model.folder, file),
      );
      console.log(`   ok   ${file}`);
    } catch (trouble) {
      missed += 1;
      console.log(`   ${config.missed}: ${file} - ${String(trouble)}`);
    }
  }
}
console.log(config.weights_done);

let served: string[] = [];
try {
  const answer = await fetch(`${config.served.host}/api/tags`);
  const found = (await answer.json()) as { models?: { name: string }[] };
  served = (found.models ?? []).map((model) => model.name);
} catch {
  console.log(`\n${config.served.no_server} ${config.served.host} - ${config.served.hint}`);
  process.exitCode = 1;
}
if (served.length > 0 || process.exitCode !== 1) {
  for (const model of config.served.models) {
    if (served.includes(model)) {
      console.log(`${model.padEnd(38)} ${config.served.have}`);
      continue;
    }
    console.log(`${model.padEnd(38)} ${config.served.pulling}`);
    const trouble = await pullModel(config.served.host, model);
    if (trouble) {
      missed += 1;
      console.log(`   ${config.missed}: ${trouble}`);
    }
  }
}
if (missed > 0) {
  process.exitCode = 1;
}
