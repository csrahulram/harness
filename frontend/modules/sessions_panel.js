export function makeSessionsPanel(list, actions) {
  let active = null;

  function makeItem(meta) {
    const item = document.createElement("li");
    item.className = meta.session === active ? "session active" : "session";
    item.innerHTML =
      '<span class="name"></span>' +
      '<span class="tools">' +
      '<button class="tiny" title="Rename this session">Edit</button>' +
      '<button class="tiny" title="Close this session">Close</button>' +
      "</span>";
    item.querySelector(".name").textContent = meta.name || "New session";
    item.querySelector(".name").addEventListener("click", () => actions.open(meta.session));
    const [edit, close] = item.querySelectorAll("button");
    edit.addEventListener("click", () => askRename(meta));
    close.addEventListener("click", () => askClose(meta));
    return item;
  }

  function askRename(meta) {
    const name = prompt("Session name", meta.name || "");
    if (name !== null && name.trim()) {
      actions.rename(meta.session, name.trim());
    }
  }

  function askClose(meta) {
    if (confirm('Close "' + (meta.name || "New session") + '"? It leaves the list but its chain is kept.')) {
      actions.remove(meta.session);
    }
  }

  function render(sessions, current) {
    active = current;
    list.replaceChildren(...sessions.map(makeItem));
    if (!sessions.some((meta) => meta.session === current)) {
      const fresh = document.createElement("li");
      fresh.className = "session active";
      fresh.innerHTML = '<span class="name">New session</span>';
      list.prepend(fresh);
    }
  }

  return { render };
}
