// Wires the page: keeps one conversation going, follows each turn, and lists the sessions.
import { askJson } from "./modules/ask_json.js";
import { followTurn } from "./modules/follow_turn.js";
import { makePanel } from "./modules/list_panel.js";
import { makeTurn } from "./modules/make_turn.js";
import { openSession } from "./modules/open_session.js";
import { readFile } from "./modules/read_file.js";
import { sendTurn } from "./modules/send_turn.js";
import { takeKeys } from "./modules/take_keys.js";

const thread = document.getElementById("thread");
const form = document.getElementById("ask");
const said = document.getElementById("said");
const picture = document.getElementById("picture");
const attached = document.getElementById("attached");
const send = document.getElementById("send");
const fresh = document.getElementById("fresh");

let holding = null;
let talking = "";

const panel = makePanel(
  document.getElementById("sessions"),
  async (session) => {
    talking = session;
    panel.mark(session);
    await openSession(thread, session);
    await panel.refresh();
  },
  async (session) => {
    await askJson(`/session?session=${session}`, { method: "DELETE" });
    if (talking === session) {
      talking = "";
      thread.replaceChildren();
    }
    panel.mark(talking);
    await panel.refresh();
  },
);

fresh.addEventListener("click", async () => {
  talking = "";
  panel.mark("");
  thread.replaceChildren();
  said.focus();
  await panel.refresh();
});

picture.addEventListener("change", async () => {
  const file = picture.files[0];
  holding = file ? await readFile(file) : null;
  attached.hidden = !holding;
  attached.textContent = holding ? `attached ${holding.name}` : "";
});

function grow() {
  said.style.height = "auto";
  said.style.height = `${said.scrollHeight}px`;
}

said.addEventListener("input", grow);
takeKeys(said, form, grow);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const words = said.value.trim();
  if (!words && !holding) {
    return;
  }
  send.disabled = true;
  thread.append(makeTurn("You", words, holding?.data).turn);
  const waiting = makeTurn("Harness", "", null);
  thread.append(waiting.turn);
  said.value = "";
  grow();
  const sent = holding;
  holding = null;
  picture.value = "";
  attached.hidden = true;
  try {
    const { task, session, poll_ms, forgot } = await sendTurn(words, sent, talking);
    talking = session;
    panel.mark(session);
    panel.refresh();
    if (forgot) {
      waiting.forgot(forgot);
    }
    await followTurn(task, poll_ms, waiting);
  } catch (trouble) {
    waiting.stopped(String(trouble.message ?? trouble));
  }
  panel.refresh();
  send.disabled = false;
  said.focus();
});

panel.refresh();
