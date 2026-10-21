// Sends a file from the page folder, never cached, or a plain 404 when there is no such file.
import { readFileSync } from "node:fs";
import type { ServerResponse } from "node:http";
import { extname } from "node:path";

const TYPES: { [ending: string]: string } = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export function sendFile(response: ServerResponse, path: string): void {
  try {
    const body = readFileSync(path);
    response.writeHead(200, {
      "Content-Type": TYPES[extname(path)] ?? "text/plain",
      "Cache-Control": "no-store, must-revalidate",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("no such page");
  }
}
