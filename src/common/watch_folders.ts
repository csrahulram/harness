// Watches the given folders and reports each unit of work once it has settled, and only once.
import { watch } from "node:fs";
import { join } from "node:path";

export function watchFolders(
  root: string,
  folders: string[],
  settleMs: number,
  repeatMs: number,
  unitOf: (folder: string, file: string) => string,
  onChange: (folder: string, unit: string) => void,
): void {
  const waiting = new Map<string, NodeJS.Timeout>();
  const fired = new Map<string, number>();
  for (const folder of folders) {
    watch(join(root, folder), { recursive: true }, (_kind, name) => {
      if (!name) {
        return;
      }
      const unit = unitOf(folder, String(name).replaceAll("\\", "/"));
      const key = `${folder}/${unit}`;
      clearTimeout(waiting.get(key));
      waiting.set(
        key,
        setTimeout(() => {
          waiting.delete(key);
          const now = performance.now();
          if (now - (fired.get(key) ?? -repeatMs) < repeatMs) {
            return;
          }
          fired.set(key, now);
          onChange(folder, unit);
        }, settleMs),
      );
    });
  }
}
