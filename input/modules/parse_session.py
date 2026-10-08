# Turns a raw request body into a session request (rename or close), or None.
import json

from common.safe_name import safe_name


def parse_session(raw, pattern, max_name_chars):
    try:
        body = json.loads(raw)
    except ValueError:
        return None
    if not isinstance(body, dict) or not safe_name(body.get("session"), pattern):
        return None
    name = body.get("name", "")
    if not isinstance(name, str) or len(name) > max_name_chars:
        return None
    return {"session": body["session"], "name": name.strip(), "close": body.get("close") is True}
