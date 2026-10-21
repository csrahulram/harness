// Decides, from the words alone, whether a tool should answer this instead of a model.
export type Chore = {
  tool: string;
  job: string;
  when: string[];
  unless?: string[];
  goes_to?: string;
};

export function pickJob(words: string, chores: Chore[]): Chore | undefined {
  const said = words.toLowerCase();
  const spoken = said.split(/[^a-z0-9']+/).filter(Boolean);
  for (const chore of chores) {
    if (!chore.when.some((phrase) => said.includes(phrase))) {
      continue;
    }
    if (!(chore.unless ?? []).some((word) => spoken.includes(word))) {
      return chore;
    }
  }
  return undefined;
}
