// Puts what was found in order, weighing how near it reads against where the source itself put it.
export function orderFound(
  count: number,
  near: { at: number; near: number }[],
  weight: number,
  keeps: number,
): number[] {
  const scored = new Map(near.map((one) => [one.at, one.near]));
  return Array.from({ length: count }, (_, at) => at)
    .map((at) => ({ at, score: (scored.get(at) ?? 0) + (1 - at / count) * weight }))
    .sort((one, two) => two.score - one.score)
    .slice(0, keeps)
    .map((one) => one.at);
}
