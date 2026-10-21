// Loads the model that judges whether words are an attack, and nothing else.
import { pipeline, type TextClassificationPipeline } from "@huggingface/transformers";

import { useLocalModels } from "../../../common/local_models.ts";

type Dtype = NonNullable<NonNullable<Parameters<typeof pipeline>[2]>["dtype"]>;

export async function loadClassifier(
  folder: string,
  model: string,
  dtype?: string,
): Promise<TextClassificationPipeline> {
  useLocalModels(folder);
  return pipeline("text-classification", model, dtype ? { dtype: dtype as Dtype } : {});
}
