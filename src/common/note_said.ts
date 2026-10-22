// Keeps what one agent said, in the shape a step carries and a page can show.
import type { Record } from "./make_record.ts";
import type { Said } from "./make_step.ts";

export function noteSaid(record: Record): Said {
  return {
    agent: record.agent,
    model: record.model,
    reason: record.reason,
    text: record.text ?? "",
    seconds: record.seconds,
    ...(record.sent ? { sent: record.sent, room: record.room } : {}),
  };
}
