// Coder: a second instance of this harness, in its own folder, that takes debug notes and fixes code.
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { readBody } from "../common/read_body.ts";
import { sendJson } from "../common/send_json.ts";
import config from "./config.json" with { type: "json" };
import { takeNote } from "./modules/take_note.ts";

const here = dirname(fileURLToPath(import.meta.url));
const notes = join(here, "..", "..", config.workspace, config.notes_folder);
const rules = { needs: config.needs, most: config.most_waiting };

createServer((request, response) => {
  const asked = new URL(request.url ?? "/", `http://${config.bind}`);
  if (request.method === "POST" && asked.pathname === config.fix_path) {
    readBody(request)
      .then((body) => {
        let sent: unknown;
        try {
          sent = JSON.parse(body.slice(0, config.max_chars));
        } catch {
          sendJson(response, 400, { error: config.bad_json });
          return;
        }
        const took = takeNote(notes, sent, rules);
        if (!took.note) {
          const error = took.why ? `${config.short_note}: ${took.why}` : config.too_many;
          sendJson(response, took.why ? 400 : 429, { error, waiting: took.waiting });
          return;
        }
        console.log(`took ${took.note.fault}: ${took.note.asked}`);
        sendJson(response, 200, { ok: config.took_it, waiting: took.waiting });
      })
      .catch(() => sendJson(response, 400, { error: config.bad_json }));
    return;
  }
  if (request.method === "GET" && asked.pathname === config.state_path) {
    sendJson(response, 200, { coder: config.coder, port: config.port });
    return;
  }
  sendJson(response, 404, { error: config.no_route });
}).listen(config.port, config.bind, () => {
  console.log(
    config.started
      .replace("{bind}", config.bind)
      .replace("{port}", String(config.port))
      .replace("{path}", config.fix_path),
  );
});
