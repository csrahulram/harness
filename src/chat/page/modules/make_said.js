// Builds one line of the trail: which agent spoke, what it said, and what it was given.
import { makeBlocks } from "./make_blocks.js";

export function makeSaid(said) {
  const line = document.createElement("li");
  const head = document.createElement("div");
  head.className = "head";
  head.textContent = `${said.agent} - ${said.model}  ${said.seconds}s`;
  const what = document.createElement("div");
  what.className = "what";
  what.textContent = said.text ? said.text : said.reason;
  line.append(head, what);
  if (said.sent?.length) {
    line.append(makeBlocks(said.sent, said.room));
  }
  return line;
}
