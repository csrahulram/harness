// Splits what was said into whole exchanges to keep word for word, and the older ones to condense.
export type Spoken = { role: string; content: string };

export function splitTalk(
  talk: Spoken[],
  mostChars: number,
  keepsPart: number,
): { older: Spoken[]; newest: Spoken[]; chars: number } {
  const chars = talk.reduce((all, said) => all + said.content.length, 0);
  if (chars <= mostChars) {
    return { older: [], newest: talk, chars };
  }
  const turns: Spoken[][] = [];
  for (const said of talk) {
    if (said.role === "user" || turns.length === 0) {
      turns.push([said]);
    } else {
      turns[turns.length - 1]!.push(said);
    }
  }
  const room = Math.floor(mostChars * keepsPart);
  const kept: Spoken[][] = [];
  let used = 0;
  for (let at = turns.length - 1; at >= 0; at -= 1) {
    const turn = turns[at]!;
    const size = turn.reduce((all, said) => all + said.content.length, 0);
    if (used + size > room && kept.length > 0) {
      break;
    }
    used += size;
    kept.unshift(turn);
  }
  const newest = kept.flat();
  return { older: talk.slice(0, talk.length - newest.length), newest, chars };
}
