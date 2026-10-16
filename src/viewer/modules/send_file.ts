// Sends a file from the page folder, or a plain 404 when there is no such file.
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import type { ServerResponse } from "node:http";

const TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};

export function sendFile(response: ServerResponse, path: string): void {
  try {
    const body = readFileSync(path);
    response.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "text/plain" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("no such page");
  }
}
