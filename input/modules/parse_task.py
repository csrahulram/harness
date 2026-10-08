# Turns a raw request body into a task dict, or None when it is malformed.
import json

from common.safe_name import safe_name


def parse_task(raw, pattern, default_mode):
    try:
        body = json.loads(raw)
    except ValueError:
        return None
    if not isinstance(body, dict):
        return None
    session = body.get("session")
    text = body.get("text")
    if not safe_name(session, pattern) or not isinstance(text, str):
        return None
    if not text.strip():
        return None
    mode = body.get("mode", default_mode)
    if not safe_name(mode, pattern):
        return None
    files = body.get("files", [])
    if not isinstance(files, list) or len(files) > 4:
        return None
    return {"session": session, "mode": mode, "text": text, "files": files}
