// Says in one line what changed and where, so the watcher can be read as it runs.
export function reportChange(folder: string, file: string): string {
  const at = new Date().toISOString().slice(11, 19);
  return `${at}  ${folder.padEnd(10)} ${file}`;
}
