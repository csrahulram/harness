// Sifter agent: puts what was found in order of how near each piece is to what was asked.
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

import { keepAwake } from "../../common/keep_awake.ts";
import { useLocalModels } from "../../common/local_models.ts";
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };
import { rankNear } from "./modules/rank_near.ts";

type Dtype = NonNullable<NonNullable<Parameters<typeof pipeline>[2]>["dtype"]>;

export const settings = config;
export const state: { embed?: FeatureExtractionPipeline } = {};

export async function load(): Promise<void> {
  useLocalModels(config.models);
  state.embed ??= await pipeline("feature-extraction", config.model, {
    dtype: config.dtype as Dtype,
  });
}

export function unload(): void {
  delete state.embed;
}

export async function run(task: { asked: string; pieces: string[] }): Promise<Record> {
  const start = performance.now();
  if (!task.asked || task.pieces.length === 0) {
    return makeRecord(false, config.empty_reason, config.agent, config.model, start);
  }
  await load();
  keepAwake(config.agent, unload);
  const words = [task.asked, ...task.pieces].map((one) => one.slice(0, config.most_chars));
  const made = await state.embed!(words, { pooling: "mean", normalize: true });
  const all = made.tolist() as number[][];
  const asked = all[0]!;
  const order = rankNear(asked, all.slice(1));
  return makeRecord(true, config.done_reason, config.agent, config.model, start, {
    facts: { order: JSON.stringify(order) },
  });
}
