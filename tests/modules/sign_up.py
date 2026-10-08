# Creates a throwaway account and returns its name and token.
import uuid

from tests.modules.post_json import post_json


def sign_up(input_url):
    name = "tester_" + uuid.uuid4().hex[:8]
    status, body = post_json(input_url, "/signup", {"user": name, "password": "a-good-password"})
    return (name, body["token"]) if status == 200 else (name, None)
