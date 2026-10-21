// Hands one turn to the harness, which writes it into the input folder.
import { askJson } from "./ask_json.js";

export async function sendTurn(words, picture, session) {
  const said = await askJson("/say", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: words, picture, session }),
  });
  if (!said.task) {
    throw new Error("the harness answered without a turn - restart it, it is running older code");
  }
  return said;
}
