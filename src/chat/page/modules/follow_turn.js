// Follows one turn's chain, showing what each agent says, until a reply or a refusal lands.
import { askJson } from "./ask_json.js";

export function followTurn(task, pollMs, turn) {
  return new Promise((done) => {
    const look = async () => {
      const state = await askJson(`/turn?task=${task}`);
      turn.show(state.steps, true);
      if (state.stopped) {
        turn.stopped(state.stopped);
        done();
        return;
      }
      if (state.reply) {
        turn.answered(state.reply);
        done();
        return;
      }
      setTimeout(look, pollMs);
    };
    look();
  });
}
