// Collects the whole body of a request as text before anything looks at it.
import type { IncomingMessage } from "node:http";

export function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((keep, fail) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (piece: string) => {
      body += piece;
    });
    request.on("end", () => keep(body));
    request.on("error", fail);
  });
}
