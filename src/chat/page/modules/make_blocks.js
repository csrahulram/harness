// Draws what went into one model call as stacked bars, so the context window can be read at a glance.
export function makeBlocks(sent, room) {
  const box = document.createElement("div");
  box.className = "context";
  const total = sent.reduce((all, one) => all + one.chars, 0);
  const head = document.createElement("button");
  head.type = "button";
  head.className = "contexthead";
  head.textContent = room
    ? `context  ${total} of ${room} chars  (${Math.round((100 * total) / room)}%)`
    : `context  ${total} chars`;
  const bars = document.createElement("div");
  bars.className = "bars";
  for (const one of sent) {
    const row = document.createElement("div");
    row.className = `bar ${one.role}`;
    row.style.setProperty("--share", `${(100 * one.chars) / (total || 1)}%`);
    const name = document.createElement("span");
    name.className = "barname";
    name.textContent = one.name;
    const size = document.createElement("span");
    size.className = "barsize";
    size.textContent = `${one.chars}`;
    const body = document.createElement("pre");
    body.className = "bartext";
    body.textContent = one.text;
    row.append(name, size, body);
    bars.append(row);
  }
  head.addEventListener("click", () => box.classList.toggle("open"));
  box.append(head, bars);
  return box;
}
