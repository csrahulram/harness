// Thinker agent: answers in words, on the smallest model on the server that can take the work.
import harness from "../../config.json" with { type: "json" };
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };
import { answerOnly } from "./modules/answer_only.ts";
import { askOllama, type Spoken } from "./modules/ask_ollama.ts";
import { pickRung, type Rung } from "./modules/pick_rung.ts";

export const settings = config;
export const state: { asked: string[] } = { asked: [] };

export async function load(): Promise<void> {
  try {
    await fetch(`${config.host}/api/tags`);
  } catch {
    state.asked = [];
  }
}

export function unload(): void {
  for (const model of state.asked) {
    void fetch(`${config.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [], keep_alive: 0 }),
    }).catch(() => undefined);
  }
  state.asked = [];
}

export async function run(task: {
  job: string;
  text: string;
  history?: Spoken[];
  rung?: number;
}): Promise<Record> {
  const start = performance.now();
  const asked = (config.prompts as { [name: string]: string })[task.job];
  const rungs = config.rungs as Rung[];
  const rung = rungs[task.rung ?? 0];
  if (!rung) {
    return makeRecord(false, config.no_rung_reason, config.agent, config.agent, start);
  }
  if (!asked) {
    return makeRecord(false, config.unknown_job, config.agent, rung.model, start);
  }
  if (!task.text) {
    return makeRecord(false, config.empty_reason, config.agent, rung.model, start);
  }
  const history = task.history ?? [];
  const judged = pickRung(rung, task.text, history, asked);
  if (judged) {
    const why = judged === "long" ? config.too_long_reason : config.no_talk_reason;
    return makeRecord(false, why, config.agent, rung.model, start, { climb: true });
  }
  const got = await askOllama(
    config.host,
    rung.model,
    [{ role: "system", content: asked }, ...history, { role: "user", content: task.text }],
    rung.num_predict,
    `${harness.idle_ms}ms`,
  );
  if (!got) {
    return makeRecord(false, config.no_server_reason, config.agent, rung.model, start);
  }
  if (!state.asked.includes(rung.model)) {
    state.asked.push(rung.model);
  }
  const split = answerOnly(got.content, config.end_of_thinking);
  const finished = Boolean(got.thinking) || split.finished;
  if (rung.thinks && !finished) {
    return makeRecord(false, config.unfinished_reason, config.agent, rung.model, start, {
      climb: true,
    });
  }
  const words = rung.thinks
    ? (got.thinking ? got.content : split.answer).trim()
    : got.content.trim();
  if (!words) {
    return makeRecord(false, config.nothing_said_reason, config.agent, rung.model, start, {
      climb: true,
    });
  }
  return makeRecord(true, config.allowed_reason, config.agent, rung.model, start, { text: words });
}
