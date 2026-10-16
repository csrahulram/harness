// Keeps the answer and sets the model's thinking aside, so each can be read on its own.
export function answerOnly(
  said: string,
  endOfThinking: string,
): {
  thinking: string;
  answer: string;
} {
  const at = said.indexOf(endOfThinking);
  if (at < 0) {
    return { thinking: "", answer: said.trim() };
  }
  return {
    thinking: said.slice(0, at).replace("<think>", "").trim(),
    answer: said.slice(at + endOfThinking.length).trim(),
  };
}
