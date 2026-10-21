// Forgets a loaded model when nothing has asked for it in a while, so idle models stop holding memory.
import config from "../config.json" with { type: "json" };

const waiting = new Map<string, NodeJS.Timeout>();

export function keepAwake(name: string, forget: () => void): void {
  clearTimeout(waiting.get(name));
  if (config.idle_ms <= 0) {
    return;
  }
  const timer = setTimeout(() => {
    waiting.delete(name);
    forget();
  }, config.idle_ms);
  timer.unref();
  waiting.set(name, timer);
}
