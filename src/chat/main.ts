// Chat: a page that drops what you say into the input folder, and watches the chain answer it.
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { readBody } from "../common/read_body.ts";
import { sendJson } from "../common/send_json.ts";
import config from "./config.json" with { type: "json" };
import { buildHistory } from "./modules/build_history.ts";
import { dropSession } from "./modules/drop_session.ts";
import { findPicture } from "./modules/find_picture.ts";
import { listSessions } from "./modules/list_sessions.ts";
import { readCarry } from "./modules/read_carry.ts";
import { readPicture } from "./modules/read_picture.ts";
import { readSession } from "./modules/read_session.ts";
import { readState } from "./modules/read_state.ts";
import { sendFile } from "./modules/send_file.ts";
import { startTurn } from "./modules/start_turn.ts";

const here = dirname(fileURLToPath(import.meta.url));
const workspace = join(here, "..", "..", config.workspace);
const scratchpad = join(workspace, config.scratchpad);
const names = { prefix: config.session_prefix, mark: config.turn_mark };

createServer((request, response) => {
  const asked = new URL(request.url ?? "/", `http://${config.bind}`);
  const wanted = asked.searchParams.get("session") ?? "";
  if (request.method === "POST" && asked.pathname === "/say") {
    readBody(request)
      .then((body) => {
        const sent = JSON.parse(body) as {
          text?: string;
          session?: string;
          picture?: { name: string; data: string };
        };
        const said = (sent.text ?? "").slice(0, config.max_chars).trim();
        const picture = readPicture(sent.picture, config.pictures);
        if (!said && !picture) {
          sendJson(response, 400, { error: config.nothing_said });
          return;
        }
        if (sent.picture && !picture) {
          sendJson(response, 400, { error: config.bad_picture });
          return;
        }
        const session = sent.session ?? "";
        const carried = session
          ? readCarry(
              join(workspace, config.input),
              scratchpad,
              session,
              config.turn_mark,
              config.carry_file,
            )
          : [];
        const before =
          session && carried.length === 0 ? readSession(scratchpad, session, config.turn_mark) : [];
        const older = buildHistory(before, config.history_chars, {
          them: config.them_role,
          me: config.me_role,
        });
        const history = carried.length > 0 ? carried : older.history;
        const forgot = carried.length > 0 ? 0 : older.forgot;
        const task = startTurn(
          join(workspace, config.input),
          { ...names, prompt: config.prompt_file, history: config.history_file },
          { session, said, history, picture },
        );
        const at = task.lastIndexOf(config.turn_mark);
        sendJson(response, 200, {
          task,
          session: task.slice(0, at),
          forgot,
          poll_ms: config.poll_ms,
        });
      })
      .catch((trouble: unknown) => sendJson(response, 500, { error: String(trouble) }));
    return;
  }
  if (asked.pathname === "/sessions") {
    sendJson(response, 200, {
      sessions: listSessions(scratchpad, config.session_prefix, config.turn_mark),
    });
    return;
  }
  if (request.method === "DELETE" && asked.pathname === "/session") {
    const gone = dropSession(
      workspace,
      { input: config.input, scratchpad: config.scratchpad, output: config.output },
      wanted,
      names,
    );
    sendJson(response, gone ? 200 : 400, { gone });
    return;
  }
  if (asked.pathname === "/picture") {
    sendFile(
      response,
      findPicture(
        join(workspace, config.input),
        asked.searchParams.get("task") ?? "",
        config.pictures,
      ),
    );
    return;
  }
  if (asked.pathname === "/turn") {
    sendJson(response, 200, readState(scratchpad, asked.searchParams.get("task") ?? ""));
    return;
  }
  if (asked.pathname === "/state") {
    sendJson(response, 200, { turns: readSession(scratchpad, wanted, config.turn_mark) });
    return;
  }
  const path = asked.pathname === "/" ? "index.html" : asked.pathname.replace(/^\//, "");
  sendFile(response, join(here, config.page, path));
}).listen(config.port, config.bind, () => {
  console.log(`chat on http://${config.bind}:${config.port}`);
});
