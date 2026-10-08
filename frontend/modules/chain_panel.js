export function makeChainPanel(cards, json) {
  let chain = [];

  function summary(entry) {
    if (entry.agent === "end") {
      return "by " + entry.output.by + " · " + entry.output.reason;
    }
    const parts = [entry.validation.reason || entry.status];
    if (entry.validation.tokens !== undefined) {
      parts.push(entry.validation.tokens + " / " + entry.validation.token_limit + " tokens");
    }
    if (entry.output && entry.output.score !== undefined) {
      parts.push("score " + entry.output.score);
    }
    if (entry.output && entry.output.model) {
      parts.push(entry.output.model);
    }
    if (entry.output && entry.output.memory) {
      const held = Object.keys(entry.output.memory);
      parts.push(held.length ? "recalled " + held.join(" and ") : "nothing remembered yet");
    }
    const context = entry.output && entry.output.context;
    if (context) {
      parts.push(context.turns + " turns remembered");
      parts.push(context.prompt_tokens + " / " + context.budget + " context tokens");
      for (const [name, tokens] of Object.entries(context.remembered || {})) {
        parts.push(name + " " + tokens + " tokens");
      }
      if (context.dropped) {
        parts.push(context.dropped + " turns dropped to fit");
      }
    }
    const resources = entry.validation.resources;
    if (resources && resources.weights === "loaded") {
      parts.push("model loaded");
    }
    if (resources && resources.drift) {
      parts.push("weights drifted by " + resources.drift);
    }
    return parts.join(" · ");
  }

  function cardClass(entry) {
    if (entry.agent === "end") {
      return "card end";
    }
    return entry.status === "ok" ? "card" : "card bad";
  }

  function makeCard(entry) {
    const card = document.createElement("li");
    card.className = cardClass(entry);
    const seconds = entry.agent === "end" ? "" : entry.seconds + " s";
    card.innerHTML =
      '<div class="title"><span>' + entry.step + " · " + entry.agent + "</span><span>" + seconds + "</span></div>" +
      '<div class="meta">' + summary(entry) + "</div>";
    card.addEventListener("click", () => toggleDetail(card, entry));
    return card;
  }

  function toggleDetail(card, entry) {
    const open = card.querySelector("pre");
    if (open) {
      open.remove();
      return;
    }
    const detail = document.createElement("pre");
    detail.textContent = JSON.stringify({ input: entry.input, output: entry.output }, null, 2);
    card.appendChild(detail);
  }

  function render(entries) {
    for (const entry of entries.slice(chain.length)) {
      cards.appendChild(makeCard(entry));
    }
    chain = entries;
    json.textContent = JSON.stringify(chain, null, 2);
    cards.scrollTop = cards.scrollHeight;
  }

  function toggleJson() {
    json.hidden = !json.hidden;
  }

  function reset() {
    chain = [];
    cards.replaceChildren();
    json.textContent = "";
  }

  return { render, toggleJson, reset };
}
