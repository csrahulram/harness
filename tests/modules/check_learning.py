# Checks a fact learned in one session is recalled in another, and can be forgotten.
import uuid

from tests.modules.fetch_json import fetch_json
from tests.modules.post_json import post_json
from tests.modules.wait_result import wait_result


def check_learning(input_url, output_url, token, timeout, pause):
    taught = "learn_" + uuid.uuid4().hex[:8]
    sent = post_json(input_url, "/task", {"session": taught, "text": "My dog is called Luna."}, token)[1]
    wait_result(output_url, taught, sent["task"], timeout, pause, token)
    learned = fetch_json(output_url, "/facts", token)["facts"]

    asked = "recall_" + uuid.uuid4().hex[:8]
    sent = post_json(input_url, "/task", {"session": asked, "text": "What is my dog called?"}, token)[1]
    result = wait_result(output_url, asked, sent["task"], timeout, pause, token)
    chain = fetch_json(output_url, "/history", token, session=asked)["chain"]
    facts = [f for e in chain if e["agent"] == "memory_recall" for f in e["output"].get("facts", [])]
    reply = (result or {}).get("reply", "")

    forgotten = post_json(input_url, "/forget", {"id": learned[0]["id"]}, token)[0] if learned else 0
    left = len(fetch_json(output_url, "/facts", token)["facts"])
    passed = bool(learned) and bool(facts) and "luna" in reply.lower() and forgotten == 200 and left == len(learned) - 1
    return passed, "learning", None, [f"learned={len(learned)}", f"recalled={len(facts)}"], reply[:40]
