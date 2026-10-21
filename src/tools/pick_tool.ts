// Hands back the tool a workflow asked for by name, and nothing at all if there is no such tool.
import type { Record } from "../common/make_record.ts";
import * as clock from "./clock/main.ts";
import * as web from "./web/main.ts";

export type Tool = {
  run: (task: { job: string; query?: string; url?: string }) => Promise<Record>;
};

export function pickTool(name: string): Tool | undefined {
  const all: { [name: string]: Tool } = { clock, web };
  return all[name];
}
