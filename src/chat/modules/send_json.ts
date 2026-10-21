// Sends one JSON answer and closes the response.
import type { ServerResponse } from "node:http";

export function sendJson(response: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(text);
}
