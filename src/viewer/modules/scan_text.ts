// Scores every chunk of a text with the guard, keeping how long each one took.
import * as guard from "../../agents/guard/main.ts";
import { splitText } from "../../modules/split_text.ts";

export type Chunk = {
  at: number;
  from: number;
  chars: number;
  safety: number;
  allowed: boolean;
  ms: number;
  start: string;
};

export async function scanText(text: string, size: number, overlap: number): Promise<Chunk[]> {
  const pieces = splitText(text, size, overlap);
  const step = Math.max(1, size - overlap);
  const scored: Chunk[] = [];
  for (const [at, piece] of pieces.entries()) {
    const began = performance.now();
    const record = await guard.run({ text: piece });
    scored.push({
      at,
      from: at * step,
      chars: piece.length,
      safety: record.score ?? 0,
      allowed: record.allowed,
      ms: Math.round(performance.now() - began),
      start: piece.slice(0, 60).replace(/\s+/g, " ").trim(),
    });
  }
  return scored;
}
