// Coder tool: the only part of the live harness that hands work to the coder instance. It owns no model.
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };
import { postNote } from "./modules/post_note.ts";

export const settings = config;
export const state = {};

export function load(): void {}

export function unload(): void {}

export async function run(task: { job: string; text?: string }): Promise<Record> {
  const start = performance.now();
  if (task.job === "ask") {
    const there = await postNote(`${config.host}${config.state_path}`, "", config.wait_ms);
    return makeRecord(
      !!there,
      there ? config.awake : config.no_coder,
      config.tool,
      config.tool,
      start,
    );
  }
  if (task.job !== "send") {
    return makeRecord(false, config.unknown_job, config.tool, config.tool, start);
  }
  if (!task.text) {
    return makeRecord(false, config.no_note, config.tool, config.tool, start);
  }
  const sent = await postNote(`${config.host}${config.fix_path}`, task.text, config.wait_ms);
  if (!sent) {
    return makeRecord(false, config.no_coder, config.tool, config.tool, start);
  }
  if (sent.code !== 200) {
    return makeRecord(false, `${config.refused}: ${sent.said}`, config.tool, config.tool, start);
  }
  return makeRecord(true, config.sent, config.tool, config.tool, start, { text: sent.said });
}
