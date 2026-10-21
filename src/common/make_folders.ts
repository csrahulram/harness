// Makes sure every folder the harness watches exists before anything watches it.
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export function makeFolders(root: string, folders: string[]): void {
  for (const folder of folders) {
    mkdirSync(join(root, folder), { recursive: true });
  }
}
