// Keeps the side panel in step with the sessions on disk, and lets one be opened or thrown away.
import { askJson } from "./ask_json.js";

export function makePanel(list, onOpen, onDrop) {
  let showing = "";
  const draw = (sessions) => {
    list.replaceChildren(
      ...sessions.map((entry) => {
        const row = document.createElement("li");
        row.className = entry.session === showing ? "open" : "";
        const what = document.createElement("span");
        what.className = "what";
        what.textContent = entry.prompt || entry.session;
        what.title = entry.prompt || entry.session;
        const when = document.createElement("span");
        when.className = "when";
        when.textContent = `${entry.turns > 1 ? `${entry.turns}  ` : ""}${new Date(entry.when).toTimeString().slice(0, 5)}`;
        const drop = document.createElement("button");
        drop.className = "drop";
        drop.type = "button";
        drop.textContent = "×";
        drop.title = "delete this session";
        drop.addEventListener("click", (event) => {
          event.stopPropagation();
          onDrop(entry.session);
        });
        row.append(what, when, drop);
        row.addEventListener("click", () => onOpen(entry.session));
        return row;
      }),
    );
  };
  return {
    async refresh() {
      try {
        const { sessions } = await askJson("/sessions");
        draw(sessions);
      } catch (trouble) {
        list.replaceChildren(makeTrouble(trouble));
      }
    },
    mark(session) {
      showing = session;
    },
  };
}

function makeTrouble(trouble) {
  const row = document.createElement("li");
  row.className = "trouble";
  row.textContent = String(trouble.message ?? trouble);
  return row;
}
