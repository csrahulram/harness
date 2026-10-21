// Says whether a second model's answer is worth passing on, or is a shrug dressed as an answer.
export function weighAnswer(said: string, noUse: string[], least: number): string {
  const words = said.trim();
  const bare = words
    .toLowerCase()
    .replace(/[.!?]+$/, "")
    .trim();
  if (words.length < least || noUse.includes(bare)) {
    return "";
  }
  return words;
}
