// Thinker agent: reads one piece of text and says what it is and what to do with it.
import { pipeline, type TextGenerationPipeline } from "@huggingface/transformers";

import { useLocalModels } from "../../modules/local_models.ts";
import { makeRecord, type Record } from "../../modules/make_record.ts";
import config from "./config.json" with { type: "json" };
import { answerOnly } from "./modules/answer_only.ts";

type Dtype = NonNullable<NonNullable<Parameters<typeof pipeline>[2]>["dtype"]>;

export const settings = config;
export const state: { generate?: TextGenerationPipeline } = {};

export async function load(): Promise<void> {
  useLocalModels(config.models);
  state.generate ??= await pipeline("text-generation", config.model, {
    dtype: config.dtype as Dtype,
  });
}

export function unload(): void {
  delete state.generate;
}

export async function run(task: { text: string }): Promise<Record> {
  const start = performance.now();
  if (!task.text) {
    return makeRecord(false, config.empty_reason, config.agent, config.model, start);
  }
  await load();
  const said = await state.generate!(
    [
      { role: "system", content: config.system_prompt },
      { role: "user", content: task.text },
    ],
    { max_new_tokens: config.max_new_tokens },
  );
  const whole = String(
    (said as unknown as { generated_text: { content: string }[] }[])[0]!.generated_text.at(-1)!
      .content,
  );
  const { answer } = answerOnly(whole, config.end_of_thinking);
  return makeRecord(true, config.allowed_reason, config.agent, config.model, start, {
    text: answer,
  });
}
