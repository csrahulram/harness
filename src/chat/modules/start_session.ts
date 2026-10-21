// Starts a session in the input folder: what the person said, and the picture if they sent one.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function startSession(
  input: string,
  prefix: string,
  said: string,
  promptFile: string,
  picture?: { ending: string; bytes: Buffer },
): string {
  const session = `${prefix}${Date.now().toString(36)}`;
  const folder = join(input, session);
  mkdirSync(folder, { recursive: true });
  if (picture) {
    writeFileSync(join(folder, `picture${picture.ending}`), picture.bytes);
  }
  writeFileSync(join(folder, promptFile), `${said}\n`, "utf8");
  return session;
}
