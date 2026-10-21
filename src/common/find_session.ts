// Picks out the session a dropped file belongs to, and nothing if it was not dropped into one.
export function findSession(file: string, prefix: string): string | undefined {
  const first = file.split("/")[0];
  if (!first || first === file || !first.startsWith(prefix)) {
    return undefined;
  }
  return first;
}
