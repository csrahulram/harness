// Throws away what came back with no substance: a heading repeating itself, or a bare line.
export function dropStubs(
  found: { title: string; words: string }[],
  least: number,
): { title: string; words: string }[] {
  return found.filter((one) => {
    const words = one.words.trim();
    const title = one.title.trim();
    if (words.length < least) {
      return false;
    }
    return words.toLowerCase() !== title.toLowerCase();
  });
}
