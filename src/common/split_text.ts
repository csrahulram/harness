// Cuts text into overlapping windows, so an attack lying across a join is still seen whole.
export function splitText(text: string, size: number, overlap: number): string[] {
  if (text.length <= size) {
    return [text];
  }
  const step = Math.max(1, size - overlap);
  const chunks: string[] = [];
  for (let at = 0; at < text.length; at += step) {
    chunks.push(text.slice(at, at + size));
    if (at + size >= text.length) {
      break;
    }
  }
  return chunks;
}
