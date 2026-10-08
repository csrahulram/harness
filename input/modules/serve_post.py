# Handles one request: checks the size and the token, then runs the route and replies.
import time

from common.send_json import send_json


def serve_post(handler, routes, deps):
    started = time.perf_counter()
    origin = deps["origin"]
    route = routes.get(handler.path)
    if route is None:
        send_json(handler, 404, {"error": "unknown route"}, origin)
        return
    needs_user, run = route
    size = int(handler.headers.get("Content-Length", 0))
    limit = deps["max_upload_bytes"] * 2 if handler.path == "/upload" else deps["max_bytes"]
    if size > limit:
        send_json(handler, 400, {"error": "that is too big"}, origin)
        return
    raw = handler.rfile.read(size)
    token = handler.headers.get("X-Token", "")
    owner = deps["users"].owner_of(token) if needs_user else None
    if needs_user and owner is None:
        send_json(handler, 401, {"error": deps["no_token"]}, origin)
        return
    send_json(handler, *run(raw, started, owner, {**deps, "token": token}), origin)
