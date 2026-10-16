// Turns the classifier's answer into a plain yes or no, with the score it was sure by.
export function judgeText(
  label: string,
  score: number,
  injectionLabel: string,
): { allowed: boolean; score: number } {
  return { allowed: label !== injectionLabel, score: Number(score.toFixed(4)) };
}
