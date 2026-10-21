// Keeps only the pieces a guard was willing to pass, since this text came from outside.
import * as guard from "../../../agents/guard/main.ts";
import type { Said } from "../../../common/make_step.ts";
import { noteSaid } from "../../../common/note_said.ts";

export async function keepSafe(
  pieces: string[],
  job: string,
  most: number,
): Promise<{ kept: string[]; said: Said[]; refused: number }> {
  const kept: string[] = [];
  const said: Said[] = [];
  let refused = 0;
  for (const piece of pieces) {
    const words = piece.slice(0, most).trim();
    if (!words) {
      continue;
    }
    const checked = await guard.run({ job, text: words });
    said.push(noteSaid(checked));
    if (checked.allowed) {
      kept.push(words);
    } else {
      refused += 1;
    }
  }
  return { kept, said, refused };
}
