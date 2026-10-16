// Watches the given folders and reports each change once it has settled.
import { watch } from "node:fs";
import { join } from "node:path";

export function watchFolders(
  root: string,
  folders: string[],
  settleMs: number,
  onChange: (folder: string, file: string) => void,
): void {
  const waiting = new Map<string, NodeJS.Timeout>();
  for (const folder of folders) {
    watch(join(root, folder), { recursive: true }, (_kind, name) => {
      if (!name) {
        return;
      }
      const file = String(name).replaceAll("\\", "/");
      const key = `${folder}/${file}`;
      clearTimeout(waiting.get(key));
      waiting.set(
        key,
        setTimeout(() => {
          waiting.delete(key);
          onChange(folder, file);
        }, settleMs),
      );
    });
  }
}
