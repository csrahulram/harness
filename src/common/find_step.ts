// Picks a step file out of everything else that lands in the scratchpad, and ignores the rest.
export function findStep(file: string): string | undefined {
  const parts = file.split("/");
  const folder = parts[0];
  const name = parts[1];
  if (parts.length !== 2 || !folder || !name || !/^step_\d+\.json$/.test(name)) {
    return undefined;
  }
  return folder;
}
