// Fetches one file into place, and leaves nothing behind if the fetch does not finish.
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function fetchFile(from: string, to: string): Promise<void> {
  const answer = await fetch(from);
  if (!answer.ok || !answer.body) {
    throw new Error(`${answer.status} ${answer.statusText}`);
  }
  await mkdir(dirname(to), { recursive: true });
  const part = `${to}.part`;
  try {
    await pipeline(Readable.fromWeb(answer.body as never), createWriteStream(part));
    await rename(part, to);
  } catch (trouble) {
    await rm(part, { force: true });
    throw trouble;
  }
}
