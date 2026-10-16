// Guard agent: decides whether a piece of text is safe for another model to read.
import { pipeline, type TextClassificationPipeline } from "@huggingface/transformers";

import { useLocalModels } from "../../modules/local_models.ts";
import { makeRecord, type Record } from "../../modules/make_record.ts";
import config from "./config.json" with { type: "json" };
import { judgeText } from "./modules/judge_text.ts";

export const settings = config;
export const state: { classify?: TextClassificationPipeline } = {};

export async function load(): Promise<void> {
  useLocalModels(config.models);
  state.classify ??= await pipeline("text-classification", config.model);
}

export function unload(): void {
  delete state.classify;
}

export async function run(task: { text: string }): Promise<Record> {
  const start = performance.now();
  if (!task.text) {
    return makeRecord(false, config.empty_reason, config.agent, config.model, start);
  }
  await load();
  const answers = await state.classify!(task.text);
  const first = Array.isArray(answers) ? answers[0]! : answers;
  const seen = judgeText(first.label, first.score, config.injection_label);
  const reason = seen.allowed ? config.allowed_reason : config.blocked_reason;
  return makeRecord(seen.allowed, reason, config.agent, config.model, start, {
    score: seen.allowed ? seen.score : Number((1 - seen.score).toFixed(4)),
  });
}
