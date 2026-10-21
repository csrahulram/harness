// Loads the model that can read words off a picture, and nothing else.
import {
  AutoProcessor,
  Florence2ForConditionalGeneration,
  RawImage,
} from "@huggingface/transformers";

import { useLocalModels } from "../../../common/local_models.ts";

type Options = NonNullable<Parameters<typeof Florence2ForConditionalGeneration.from_pretrained>[1]>;

export type Reader = {
  (image: RawImage): Promise<object>;
  tokenizer: (words: string) => object;
  construct_prompts: (job: string) => string;
  batch_decode: (ids: unknown, how: { skip_special_tokens: boolean }) => string[];
  post_process_generation: (raw: string, job: string, size: number[]) => { [job: string]: unknown };
};

export type Eyes = {
  model: Awaited<ReturnType<typeof Florence2ForConditionalGeneration.from_pretrained>>;
  reader: Reader;
};

export async function loadEyes(
  folder: string,
  model: string,
  dtype: object,
  decoder: string,
): Promise<Eyes> {
  useLocalModels(folder);
  return {
    reader: (await AutoProcessor.from_pretrained(model)) as unknown as Reader,
    model: await Florence2ForConditionalGeneration.from_pretrained(model, {
      dtype: { ...dtype, decoder_model_merged: decoder } as Options["dtype"],
    }),
  };
}
