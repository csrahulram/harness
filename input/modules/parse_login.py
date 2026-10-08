# Reads a sign up or sign in body, checking the name is safe and the password is long enough.
import json

from common.safe_name import safe_name


def parse_login(raw, pattern, least):
    try:
        body = json.loads(raw)
    except ValueError:
        return None
    if not isinstance(body, dict) or not safe_name(body.get("user"), pattern):
        return None
    password = body.get("password")
    if not isinstance(password, str) or len(password) < least:
        return None
    return {"user": body["user"], "password": password}
