// Names a new task: short enough to read out, and ordered so the newest sorts last.
export function makeTaskId(prefix: string): string {
  const when = Date.now().toString(36);
  const extra = Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, "0");
  return `${prefix}${when}${extra}`;
}
