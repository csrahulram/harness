// Names the next turn of a session, so every turn is its own task but still says where it belongs.
export function nameTurn(session: string, taken: string[], mark: string): string {
  let highest = 0;
  for (const name of taken) {
    const at = name.lastIndexOf(mark);
    if (at > 0 && name.slice(0, at) === session) {
      highest = Math.max(highest, Number(name.slice(at + mark.length)) || 0);
    }
  }
  return `${session}${mark}${highest + 1}`;
}
