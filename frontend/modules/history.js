export function chainToMessages(chain, blockedPrefix) {
  const messages = [];
  for (const entry of chain) {
    if (entry.agent === "input" && entry.status === "ok") {
      messages.push({ role: "user", text: entry.input.text });
    } else if (entry.agent === "input") {
      messages.push({ role: "user", text: entry.input.text });
      messages.push({ role: "ai", text: blockedPrefix + entry.validation.reason });
    } else if (entry.agent === "thinker" && entry.status === "ok") {
      messages.push({ role: "ai", text: entry.output.text });
    } else if (entry.agent === "context_guard" && entry.status === "blocked") {
      messages.push({ role: "ai", text: blockedPrefix + entry.output.reason });
    }
  }
  return messages;
}
