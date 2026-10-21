// Clock tool: tells the time where the words name, from this computer's own clock. It owns no model.
import { makeRecord, type Record } from "../../common/make_record.ts";
import config from "./config.json" with { type: "json" };
import { readClock } from "./modules/read_clock.ts";

export const settings = config;
export const state = {};

export function load(): void {}

export function unload(): void {}

export function run(task: { job: string; query?: string }): Promise<Record> {
  const start = performance.now();
  if (task.job !== "now") {
    return Promise.resolve(makeRecord(false, config.unknown_job, config.tool, config.tool, start));
  }
  const read = readClock(task.query ?? "", config.zones, new Date());
  return Promise.resolve(
    makeRecord(true, config.told, config.tool, read.zone, start, {
      text: read.told,
      facts: { time: read.told, zone: read.zone, place: read.where },
    }),
  );
}
