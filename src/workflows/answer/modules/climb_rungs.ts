// Tries the smallest model first, and climbs only when the one below says it cannot do the work.
import * as thinker from "../../../agents/thinker/main.ts";
import type { Record } from "../../../common/make_record.ts";
import type { Said } from "../../../common/make_step.ts";
import { noteSaid } from "../../../common/note_said.ts";

export async function climbRungs(
  job: string,
  ask: string,
  history: { role: string; content: string }[],
  rungs: number,
  from = 0,
): Promise<{ record: Record; said: Said[] }> {
  const said: Said[] = [];
  let last: Record | undefined;
  for (let rung = from; rung < rungs; rung += 1) {
    const got = await thinker.run({ job, text: ask, history, rung });
    said.push(noteSaid(got));
    last = got;
    if (got.allowed || !got.climb) {
      break;
    }
  }
  return { record: last!, said };
}
