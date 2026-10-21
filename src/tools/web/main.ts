// Web tool: the only part of the harness that reaches outside this machine. It owns no model.
import { makeRecord, type Record } from "../../common/make_record.ts";
import { askDuckduckgo } from "./modules/ask_duckduckgo.ts";
import { askWikipedia, type Found } from "./modules/ask_wikipedia.ts";
import { readPage } from "./modules/read_page.ts";
import { safeUrl } from "./modules/safe_url.ts";
import config from "./config.json" with { type: "json" };

export const settings = config;
export const state = {};

export function load(): void {}

export function unload(): void {}

export async function run(task: { job: string; query?: string; url?: string }): Promise<Record> {
  const start = performance.now();
  if (task.job === "read") {
    const asked = task.url ?? "";
    const safe = safeUrl(asked, config.allowed_schemes);
    if (!safe) {
      return makeRecord(false, config.bad_url_reason, config.tool, asked || config.tool, start);
    }
    const words = await readPage(safe, config.most_chars, config.agent, config.wait_ms);
    if (words === undefined) {
      return makeRecord(false, config.unreachable_reason, config.tool, asked, start);
    }
    return makeRecord(true, config.read_reason, config.tool, asked, start, { text: words });
  }
  if (task.job !== "search") {
    return makeRecord(false, config.no_query_reason, config.tool, config.tool, start);
  }
  const query = (task.query ?? "").trim();
  if (!query) {
    return makeRecord(false, config.no_query_reason, config.tool, config.tool, start);
  }
  const found: Found[] = [];
  for (const [name, host] of Object.entries(config.sources)) {
    try {
      const some =
        name === "wikipedia"
          ? await askWikipedia(host, query, config.most_results, config.agent, config.wait_ms)
          : await askDuckduckgo(host, query, config.most_results, config.agent, config.wait_ms);
      found.push(...some);
    } catch {
      continue;
    }
  }
  if (found.length === 0) {
    return makeRecord(false, config.nothing_reason, config.tool, config.tool, start);
  }
  return makeRecord(
    true,
    config.found_reason,
    config.tool,
    Object.keys(config.sources).join(" + "),
    start,
    {
      text: found.map((one) => one.title).join(", "),
      facts: { found: JSON.stringify(found) },
    },
  );
}
