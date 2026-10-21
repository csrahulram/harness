// Cuts the asking away from the asked, so what reaches a search is the thing itself.
export function cleanQuery(words: string, strips: string[]): string {
  let said = words
    .trim()
    .replace(/[?!.]+$/, "")
    .trim();
  const lower = () => said.toLowerCase();
  let cutting = true;
  while (cutting) {
    cutting = false;
    for (const strip of strips) {
      if (lower().startsWith(`${strip} `) || lower() === strip) {
        said = said.slice(strip.length).trim();
        cutting = true;
        break;
      }
    }
  }
  return said || words.trim();
}
