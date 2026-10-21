// Looker agent: reads a photo with one model that can caption it, find its things, or read its text.
import {
  AutoProcessor,
  Florence2ForConditionalGeneration,
  RawImage,
} from "@huggingface/transformers";

import { useLocalModels } from "../../common/local_models.ts";
import { keepAwake } from "../../common/keep_awake.ts";
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };
import { readSeen } from "./modules/read_seen.ts";

type Model = Awaited<ReturnType<typeof Florence2ForConditionalGeneration.from_pretrained>>;
type Options = NonNullable<Parameters<typeof Florence2ForConditionalGeneration.from_pretrained>[1]>;

type Reader = {
  (image: RawImage): Promise<object>;
  tokenizer: (words: string) => object;
  construct_prompts: (job: string) => string;
  batch_decode: (ids: unknown, how: { skip_special_tokens: boolean }) => string[];
  post_process_generation: (raw: string, job: string, size: number[]) => { [job: string]: unknown };
};

export const settings = config;
export const state: { model?: Model; reader?: Reader } = {};

export async function load(): Promise<void> {
  useLocalModels(config.models);
  state.reader ??= (await AutoProcessor.from_pretrained(config.model)) as unknown as Reader;
  state.model ??= await Florence2ForConditionalGeneration.from_pretrained(config.model, {
    dtype: { ...config.dtype, decoder_model_merged: config.decoder_dtype } as Options["dtype"],
  });
}

export function unload(): void {
  delete state.model;
  delete state.reader;
}

export async function run(task: { image: string; job: string }): Promise<Record> {
  const start = performance.now();
  const asked = (config.jobs as { [name: string]: string })[task.job];
  if (!asked) {
    return makeRecord(false, config.unknown_job, config.agent, config.model, start);
  }
  if (!task.image) {
    return makeRecord(false, config.no_image_reason, config.agent, config.model, start);
  }
  await load();
  keepAwake(config.agent, unload);
  const reader = state.reader!;
  const image = await RawImage.read(task.image);
  const vision = await reader(image);
  const words = reader.tokenizer(reader.construct_prompts(asked));
  const ids = await state.model!.generate({
    ...words,
    ...vision,
    max_new_tokens: config.max_new_tokens,
  });
  const raw = reader.batch_decode(ids, { skip_special_tokens: false })[0] ?? "";
  const found = reader.post_process_generation(raw, asked, image.size);
  return makeRecord(
    true,
    config.done_reason,
    config.agent,
    config.model,
    start,
    readSeen(found[asked], image.size),
  );
}
