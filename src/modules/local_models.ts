// Points the model loader at the folder on disk, and stops it reaching for the internet.
import { env } from "@huggingface/transformers";

export function useLocalModels(folder: string): void {
  env.localModelPath = folder;
  env.allowRemoteModels = false;
}
