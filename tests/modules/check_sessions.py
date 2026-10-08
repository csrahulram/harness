# Checks a session is listed, can be renamed, and closing hides it without touching the chain.
from tests.modules.fetch_json import fetch_json
from tests.modules.post_json import post_json


def check_sessions(input_url, output_url, session, token):
    listed = [meta["session"] for meta in fetch_json(output_url, "/sessions", token)["sessions"]]
    before = len(fetch_json(output_url, "/history", token, session=session)["chain"])
    renamed = post_json(input_url, "/session", {"session": session, "name": "Renamed"}, token)[1]
    named = [m["name"] for m in fetch_json(output_url, "/sessions", token)["sessions"] if m["session"] == session]
    post_json(input_url, "/session", {"session": session, "close": True}, token)
    after = [meta["session"] for meta in fetch_json(output_url, "/sessions", token)["sessions"]]
    unchanged = len(fetch_json(output_url, "/history", token, session=session)["chain"]) == before
    passed = session in listed and named == ["Renamed"] and session not in after and unchanged
    detail = f"listed, renamed to {renamed.get('name')}, hidden, chain untouched={unchanged}"
    return passed, "sessions", None, ["list", "rename", "close"], detail
