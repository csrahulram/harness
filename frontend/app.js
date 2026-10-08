import { makeApi } from "./modules/api.js";
import { makeAuth } from "./modules/auth.js";
import { makeChainPanel } from "./modules/chain_panel.js";
import { makeNotesPanel } from "./modules/notes_panel.js";
import { styleChat } from "./modules/chat_style.js";
import { chainToMessages } from "./modules/history.js";
import { makeSessionsPanel } from "./modules/sessions_panel.js";

const STORE = { session: "harness.session", token: "harness.token", user: "harness.user" };
const BLOCKED_PREFIX = "Blocked: ";

const chat = document.getElementById("chat");
const statusLabel = document.getElementById("status");
const panel = makeChainPanel(document.getElementById("cards"), document.getElementById("json"));
const sessions = makeSessionsPanel(document.getElementById("sessions"), { open, rename, remove });

const config = await (await fetch("config.json")).json();
const auth = makeAuth(
  { account: (route, body) => sendAccount(route, body) },
  document.getElementById("gate"),
  document.getElementById("login"),
  document.getElementById("gate-message"),
  STORE,
);
const api = makeApi(config, auth.token);
const notes = makeNotesPanel(api, {
  screen: document.getElementById("notes-screen"),
  profile: document.getElementById("profile-note"),
  soul: document.getElementById("soul-note"),
  profileCount: document.getElementById("profile-count"),
  soulCount: document.getElementById("soul-count"),
  facts: document.getElementById("facts"),
  message: document.getElementById("notes-message"),
});

async function sendAccount(route, body) {
  const response = await fetch(config.urls.input + route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const reply = await response.json();
  if (!response.ok) {
    throw new Error(reply.error || "could not sign in");
  }
  return reply;
}
const pollMs = config.limits.poll_ms;
const timeoutMs = config.limits.timeout_ms;

let session = localStorage.getItem(STORE.session) || crypto.randomUUID();

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showSession() {
  localStorage.setItem(STORE.session, session);
  document.getElementById("who").textContent = auth.user();
  statusLabel.textContent = "session " + session;
}

async function refreshSessions() {
  sessions.render(await api.fetchSessions(), session);
}

async function refreshChain() {
  try {
    panel.render(await api.fetchHistory(session));
  } catch (error) {
    console.warn("chain unavailable", error);
  }
}

async function open(target) {
  session = target;
  showSession();
  panel.reset();
  const chain = await api.fetchHistory(session);
  chat.clearMessages();
  for (const message of chainToMessages(chain, BLOCKED_PREFIX)) {
    chat.addMessage(message, false);
  }
  panel.render(chain);
  await refreshSessions();
}

async function rename(target, name) {
  await api.renameSession(target, name);
  await refreshSessions();
}

async function remove(target) {
  await api.closeSession(target);
  if (target === session) {
    await open(crypto.randomUUID());
  } else {
    await refreshSessions();
  }
}

async function streamResult(task, signals) {
  const deadline = Date.now() + timeoutMs;
  let sent = 0;
  while (Date.now() < deadline) {
    const stream = await api.fetchStream(session, task);
    if (stream.text.length > sent) {
      signals.onResponse({ text: stream.text.slice(sent) });
      sent = stream.text.length;
    }
    await refreshChain();
    if (stream.done) {
      return sent;
    }
    await pause(pollMs);
  }
  throw new Error("no result yet, is workflows running?");
}

async function handle(body, signals) {
  signals.onOpen();
  try {
    const text = body.messages.at(-1).text;
    const sent = await api.sendTask(session, text);
    const streamed = await streamResult(sent.task, signals);
    const result = (await api.fetchResult(session, sent.task)).result;
    if (streamed === 0) {
      signals.onResponse({ text: result.reply });
    }
  } catch (error) {
    await refreshChain();
    signals.onResponse({ error: error.message });
  }
  signals.onClose();
  await refreshSessions();
}

document.getElementById("copy").addEventListener("click", () => navigator.clipboard.writeText(session));
document.getElementById("raw").addEventListener("click", panel.toggleJson);
document.getElementById("new").addEventListener("click", () => open(crypto.randomUUID()));

document.getElementById("login").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (await auth.submit("/signin")) {
    await begin();
  }
});
document.getElementById("register").addEventListener("click", async () => {
  if (await auth.submit("/signup")) {
    await begin();
  }
});
document.getElementById("notes").addEventListener("click", notes.open);
document.getElementById("save-notes").addEventListener("click", notes.save);
document.getElementById("close-notes").addEventListener("click", () => notes.show(false));
document.getElementById("signout").addEventListener("click", async () => {
  await api.signOut();
  auth.forget();
  location.reload();
});
document.getElementById("forget").addEventListener("click", async () => {
  if (!confirm("Delete your profile? This removes your sessions and everything remembered about you.")) {
    return;
  }
  if (!confirm("This cannot be undone. Delete " + auth.user() + "?")) {
    return;
  }
  await api.deleteAccount();
  auth.forget();
  location.reload();
});

async function begin() {
  showSession();
  await refreshSessions();
  await open(session);
}

styleChat(chat);
chat.connect = { handler: handle, stream: true };

if (auth.token()) {
  auth.show(false);
  chat.addEventListener("render", begin, { once: true });
} else {
  auth.show(true);
}
