// Puts a whole conversation back on the page, every turn of it, the way it was answered.
import { askJson } from "./ask_json.js";
import { makeTurn } from "./make_turn.js";

export async function openSession(thread, session) {
  const { turns } = await askJson(`/state?session=${session}`);
  thread.replaceChildren();
  for (const turn of turns) {
    const mine = makeTurn("You", turn.prompt, turn.picture ? `/picture?task=${turn.task}` : null);
    thread.append(mine.turn);
    const theirs = makeTurn("Harness", "", null);
    thread.append(theirs.turn);
    theirs.show(turn.steps, false);
    if (turn.stopped) {
      theirs.stopped(turn.stopped);
    } else if (turn.reply) {
      theirs.answered(turn.reply);
    }
  }
}
