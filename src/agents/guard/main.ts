// Guard agent: decides whether something is safe for another model to read, choosing its own model.
import type { TextClassificationPipeline } from "@huggingface/transformers";

import { keepAwake } from "../../common/keep_awake.ts";
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };
import { judgeText } from "./modules/judge_text.ts";
import { loadClassifier } from "./modules/load_classifier.ts";
import { loadEyes, type Eyes } from "./modules/load_eyes.ts";
import { readWords } from "./modules/read_words.ts";

type Job = { model: string; how: string; dtype?: string };

export const settings = config;
export const state: { classify?: TextClassificationPipeline; eyes?: Eyes } = {};

const jobs = config.jobs as { [name: string]: Job };
const judge = jobs[config.judges_with]!;
const looks = Object.values(jobs).find((job) => job.how === config.reads_how);

export async function load(): Promise<void> {
  state.classify ??= await loadClassifier(config.models, judge.model, judge.dtype);
  if (looks) {
    state.eyes ??= await loadEyes(config.models, looks.model, config.dtype, config.decoder_dtype);
  }
}

export function unload(): void {
  delete state.classify;
  delete state.eyes;
}

export async function run(task: { job: string; text?: string; image?: string }): Promise<Record> {
  const start = performance.now();
  const picked = jobs[task.job];
  if (!picked) {
    return makeRecord(false, config.no_guard_reason, config.agent, config.no_model, start);
  }
  let words = task.text ?? "";
  let used = picked.model;
  if (picked.how === config.reads_how) {
    if (!task.image) {
      return makeRecord(false, config.no_image_reason, config.agent, picked.model, start);
    }
    state.eyes ??= await loadEyes(config.models, picked.model, config.dtype, config.decoder_dtype);
    keepAwake(`${config.agent}:${picked.model}`, () => delete state.eyes);
    words = await readWords(
      state.eyes,
      task.image,
      config.ocr_job,
      config.max_new_tokens,
      config.no_text,
      config.least_words,
    );
    keepAwake(`${config.agent}:${picked.model}`, () => delete state.eyes);
    if (!words) {
      return makeRecord(true, config.bare_picture_reason, config.agent, picked.model, start);
    }
    used = `${picked.model} + ${judge.model}`;
  }
  if (!words) {
    return makeRecord(false, config.empty_reason, config.agent, used, start);
  }
  state.classify ??= await loadClassifier(config.models, judge.model, judge.dtype);
  keepAwake(`${config.agent}:${judge.model}`, () => delete state.classify);
  const answers = await state.classify(words);
  keepAwake(`${config.agent}:${judge.model}`, () => delete state.classify);
  const first = Array.isArray(answers) ? answers[0]! : answers;
  const seen = judgeText(first.label, first.score, config.injection_label);
  const painted = picked.how === config.reads_how;
  const reason = seen.allowed
    ? painted
      ? config.clean_picture_reason
      : config.allowed_reason
    : painted
      ? config.painted_reason
      : config.blocked_reason;
  return makeRecord(seen.allowed, reason, config.agent, used, start, {
    score: seen.allowed ? seen.score : Number((1 - seen.score).toFixed(4)),
    text: words,
  });
}
