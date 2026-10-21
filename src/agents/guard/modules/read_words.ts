// Reads whatever words are written on a picture, and gives back nothing when there are none.
import { RawImage } from "@huggingface/transformers";

import type { Eyes } from "./load_eyes.ts";

export async function readWords(
  eyes: Eyes,
  image: string,
  job: string,
  most: number,
  nothing: string,
  least: number,
): Promise<string> {
  const picture = await RawImage.read(image);
  const vision = await eyes.reader(picture);
  const asked = eyes.reader.tokenizer(eyes.reader.construct_prompts(job));
  const ids = await eyes.model.generate({ ...asked, ...vision, max_new_tokens: most });
  const raw = eyes.reader.batch_decode(ids, { skip_special_tokens: false })[0] ?? "";
  const found = eyes.reader.post_process_generation(raw, job, picture.size);
  const words = String(found[job] ?? "").trim();
  return words === nothing || words.length < least ? "" : words;
}
