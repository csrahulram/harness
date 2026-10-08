# Checks a person can read, save and clear their own memory notes through the routes.
import uuid

from tests.modules.fetch_json import fetch_json
from tests.modules.post_json import post_json
from tests.modules.wait_result import wait_result


def check_notes(input_url, output_url, token, timeout, pause):
    empty = fetch_json(output_url, "/memory", token)["notes"]
    saved = post_json(input_url, "/memory", {"profile": "My dog is Luna.", "soul": "Be brief."}, token)[1]
    back = fetch_json(output_url, "/memory", token)["notes"]
    session = "note_" + uuid.uuid4().hex[:8]
    sent = post_json(input_url, "/task", {"session": session, "text": "What is my dog called?"}, token)[1]
    result = wait_result(output_url, session, sent["task"], timeout, pause, token)
    reply = (result or {}).get("reply", "")
    cleared = post_json(input_url, "/memory", {"profile": "", "soul": ""}, token)[1]["notes"]
    passed = (
        empty == {"profile": "", "soul": ""}
        and back["profile"] == "My dog is Luna."
        and saved["tokens"]["profile"] > 0
        and "luna" in reply.lower()
        and cleared == {"profile": "", "soul": ""}
    )
    return passed, "memory notes", None, [f"{saved['tokens']}"], reply[:44]
