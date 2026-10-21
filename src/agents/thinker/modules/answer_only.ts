// Keeps the answer and sets the thinking aside, and says plainly if the thinking never finished.
export function answerOnly(
  said: string,
  endOfThinking: string,
): {
  thinking: string;
  answer: string;
  finished: boolean;
} {
  const at = said.indexOf(endOfThinking);
  if (at < 0) {
    return { thinking: said.replace("<think>", "").trim(), answer: "", finished: false };
  }
  return {
    thinking: said.slice(0, at).replace("<think>", "").trim(),
    answer: said.slice(at + endOfThinking.length).trim(),
    finished: true,
  };
}
