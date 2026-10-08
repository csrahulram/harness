# Checks a hand written profile note reaches the model in a session that never saw the fact.
import uuid

from tests.modules.fetch_json import fetch_json
from tests.modules.post_json import post_json
from tests.modules.wait_result import wait_result


def check_profile(input_url, output_url, user, token, folder, timeout, pause):
    note = folder / "users" / user / "profile.md"
    note.parent.mkdir(parents=True, exist_ok=True)
    note.write_text("# About this person\n\nTheir dog is called Luna.\n", encoding="utf-8")
    session = "prof_" + uuid.uuid4().hex[:8]
    sent = post_json(input_url, "/task", {"session": session, "text": "What is my dog called?"}, token)[1]
    result = wait_result(output_url, session, sent["task"], timeout, pause, token)
    chain = fetch_json(output_url, "/history", token, session=session)["chain"]
    recalled = [e["output"].get("memory") for e in chain if e["agent"] == "memory_recall"]
    context = [e["output"].get("context") for e in chain if e["agent"] == "thinker" and e["status"] == "ok"]
    reply = (result or {}).get("reply", "")
    held = (context[-1] or {}).get("remembered", {}) if context else {}
    passed = "luna" in reply.lower() and bool(recalled and recalled[0].get("profile")) and "profile" in held
    return passed, "profile note", (result or {}).get("allowed"), [f"profile={held.get('profile')} tokens"], reply[:46]
