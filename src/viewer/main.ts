// Viewer: serves a page that shows how the guard scored every chunk of a text, and how long it took.
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "./config.json" with { type: "json" };
import { readBody } from "./modules/read_body.ts";
import { sendFile } from "./modules/send_file.ts";
import { sendJson } from "./modules/send_json.ts";
import { scanText } from "./modules/scan_text.ts";

const here = dirname(fileURLToPath(import.meta.url));

createServer((request, response) => {
  const path = (request.url ?? "/").split("?")[0]!;
  if (request.method === "POST" && path === "/scan") {
    readBody(request)
      .then(async (text) => {
        const began = performance.now();
        const chunks = await scanText(text, config.chunk_chars, config.overlap_chars);
        sendJson(response, 200, {
          chars: text.length,
          chunks,
          ms: Math.round(performance.now() - began),
          allowed: chunks.every((chunk) => chunk.allowed),
        });
      })
      .catch((trouble: unknown) => sendJson(response, 500, { error: String(trouble) }));
    return;
  }
  sendFile(response, join(here, config.page, path === "/" ? "index.html" : path));
}).listen(config.port, config.bind, () => {
  console.log(`viewer on http://${config.bind}:${config.port}`);
});
