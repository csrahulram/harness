# Handles one request: checks the token, the query values and who owns the session, then runs it.
from urllib.parse import urlparse

from common.send_json import send_json
from output.modules.parse_query import parse_query


def serve_get(handler, routes, deps):
    origin = deps["origin"]
    owner = deps["users"].owner_of(handler.headers.get("X-Token", ""))
    if owner is None:
        send_json(handler, 401, {"error": deps["no_token"]}, origin)
        return
    route = routes.get(urlparse(handler.path).path)
    if route is None:
        send_json(handler, 404, {"error": "unknown route"}, origin)
        return
    keys, scoped, run = route
    query = parse_query(handler.path, deps["pattern"], keys)
    if query is None:
        send_json(handler, 400, {"error": f"need {' and '.join(keys)}"}, origin)
        return
    held = deps["telemetry"].owner(query["session"]) if scoped else None
    if scoped and held is not None and held != owner:
        send_json(handler, 403, {"error": deps["not_yours"]}, origin)
        return
    run(handler, query, owner, deps)
