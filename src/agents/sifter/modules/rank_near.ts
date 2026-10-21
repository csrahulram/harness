// Scores how near each piece is to what was asked, by the angle between their meanings.
export function rankNear(asked: number[], pieces: number[][]): { at: number; near: number }[] {
  const size = (one: number[]) => Math.sqrt(one.reduce((all, n) => all + n * n, 0)) || 1;
  const askedSize = size(asked);
  return pieces
    .map((piece, at) => {
      const dot = piece.reduce((all, n, i) => all + n * (asked[i] ?? 0), 0);
      return { at, near: Number((dot / (askedSize * size(piece))).toFixed(4)) };
    })
    .sort((one, two) => two.near - one.near);
}
