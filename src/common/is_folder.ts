// Says whether what arrived is a folder of work rather than a single file.
import { statSync } from "node:fs";

export function isFolder(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}
