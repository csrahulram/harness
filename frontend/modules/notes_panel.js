export function makeNotesPanel(api, parts) {
  function show(on) {
    parts.screen.hidden = !on;
  }

  function render(notes, tokens, caps) {
    parts.profile.value = notes.profile || "";
    parts.soul.value = notes.soul || "";
    count("profile", tokens, caps);
    count("soul", tokens, caps);
  }

  function count(name, tokens, caps) {
    if (!tokens) {
      parts[name + "Count"].textContent = "";
      return;
    }
    const used = tokens[name] || 0;
    const cap = (caps || {})[name] || 0;
    const over = cap && used > cap;
    parts[name + "Count"].textContent = used + " / " + cap + " tokens" + (over ? " — the rest is ignored" : "");
    parts[name + "Count"].classList.toggle("over", Boolean(over));
  }

  function listFacts(facts) {
    parts.facts.replaceChildren();
    if (!facts.length) {
      parts.facts.textContent = "Nothing learned yet. The harness adds to this as you talk.";
      return;
    }
    for (const fact of facts) {
      const row = document.createElement("li");
      row.className = "fact";
      row.innerHTML = '<span></span><button class="tiny" title="Forget this">Forget</button>';
      row.querySelector("span").textContent = fact.text;
      row.querySelector("button").addEventListener("click", async () => {
        await api.forget(fact.id);
        listFacts((await api.readFacts()).facts);
      });
      parts.facts.appendChild(row);
    }
  }

  async function open() {
    parts.message.textContent = "";
    const body = await api.readNotes();
    render(body.notes, null, null);
    listFacts((await api.readFacts()).facts);
    show(true);
  }

  async function save() {
    parts.message.textContent = "";
    try {
      const body = await api.saveNotes({ profile: parts.profile.value, soul: parts.soul.value });
      render(body.notes, body.tokens, body.caps);
      parts.message.textContent = "Saved. It takes effect on your next message.";
    } catch (error) {
      parts.message.textContent = error.message;
    }
  }

  return { open, save, show };
}
