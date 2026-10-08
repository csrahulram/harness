# Turns a raw upload request into a session, a safe file name and its bytes, or None.
import base64
import json

from common.safe_name import safe_name


def parse_upload(raw, pattern, allowed_types, max_bytes):
    try:
        body = json.loads(raw)
    except ValueError:
        return None
    if not isinstance(body, dict) or not safe_name(body.get("session"), pattern):
        return None
    suffix = str(body.get("name", "")).lower().rsplit(".", 1)[-1]
    if suffix not in allowed_types:
        return None
    try:
        data = base64.b64decode(str(body.get("data", "")), validate=True)
    except ValueError:
        return None
    if not data or len(data) > max_bytes:
        return None
    return {"session": body["session"], "suffix": suffix, "data": data}
