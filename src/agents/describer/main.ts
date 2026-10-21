// Describer agent: answers one plain question about a photo, in words.
import {
  AutoProcessor,
  RawImage,
  SmolVLMForConditionalGeneration,
} from "@huggingface/transformers";

import { useLocalModels } from "../../common/local_models.ts";
import { keepAwake } from "../../common/keep_awake.ts";
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };

type Model = Awaited<ReturnType<typeof SmolVLMForConditionalGeneration.from_pretrained>>;
type Options = NonNullable<Parameters<typeof SmolVLMForConditionalGeneration.from_pretrained>[1]>;
type Grown = { slice: (rows: null, columns: (number | null)[]) => unknown };

type Reader = {
  (words: string, images: RawImage[], how: object): Promise<{ input_ids: { dims: number[] } }>;
  apply_chat_template: (said: unknown, how: { add_generation_prompt: boolean }) => string;
  batch_decode: (ids: unknown, how: { skip_special_tokens: boolean }) => string[];
};

export const settings = config;
export const state: { model?: Model; reader?: Reader } = {};

export async function load(): Promise<void> {
  useLocalModels(config.models);
  state.reader ??= (await AutoProcessor.from_pretrained(config.model)) as unknown as Reader;
  state.model ??= await SmolVLMForConditionalGeneration.from_pretrained(config.model, {
    dtype: config.dtype as Options["dtype"],
  });
}

export function unload(): void {
  delete state.model;
  delete state.reader;
}

export async function run(task: { image: string; question: string }): Promise<Record> {
  const start = performance.now();
  if (!task.image) {
    return makeRecord(false, config.no_image_reason, config.agent, config.model, start);
  }
  if (!task.question) {
    return makeRecord(false, config.no_question_reason, config.agent, config.model, start);
  }
  await load();
  keepAwake(config.agent, unload);
  const reader = state.reader!;
  const image = await RawImage.read(task.image);
  const asked = reader.apply_chat_template(
    [{ role: "user", content: [{ type: "image" }, { type: "text", text: task.question }] }],
    { add_generation_prompt: true },
  );
  const inputs = await reader(asked, [image], {});
  const ids = (await state.model!.generate({
    ...inputs,
    max_new_tokens: config.max_new_tokens,
    do_sample: false,
  })) as unknown as Grown;
  const said = reader.batch_decode(ids.slice(null, [inputs.input_ids.dims.at(-1) ?? 0, null]), {
    skip_special_tokens: true,
  });
  return makeRecord(true, config.done_reason, config.agent, config.model, start, {
    text: (said[0] ?? "").trim().replace(/\s+/g, " "),
  });
}
