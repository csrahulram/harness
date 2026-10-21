// Says why a rung cannot take this work, or nothing at all when it can.
export type Rung = {
  model: string;
  thinks: boolean;
  budget: number;
  num_predict: number;
  follows_talk: boolean;
};

export function pickRung(
  rung: Rung,
  text: string,
  history: { content: string }[],
  system: string,
): "long" | "talk" | undefined {
  if (history.length > 0 && !rung.follows_talk) {
    return "talk";
  }
  const size =
    system.length + text.length + history.reduce((all, said) => all + said.content.length, 0);
  return size > rung.budget ? "long" : undefined;
}
