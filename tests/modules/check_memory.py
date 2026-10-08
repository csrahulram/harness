# Checks the thinker remembers an earlier message in the same session.
from tests.modules.fetch_json import fetch_json
from tests.modules.post_json import post_json
from tests.modules.wait_result import wait_result


def check_memory(input_url, output_url, session, timeout, pause, token):
    first = "My favourite colour is turquoise. Remember it."
    sent = post_json(input_url, "/task", {"session": session, "text": first}, token)[1]
    wait_result(output_url, session, sent["task"], timeout, pause, token)
    asked = post_json(input_url, "/task", {"session": session, "text": "What is my favourite colour?"}, token)[1]
    result = wait_result(output_url, session, asked["task"], timeout, pause, token)
    chain = fetch_json(output_url, "/history", token, session=session)["chain"]
    context = [e["output"].get("context") for e in chain if e["agent"] == "thinker" and e["status"] == "ok"]
    reply = (result or {}).get("reply", "")
    passed = "turquoise" in reply.lower() and bool(context and context[-1]["turns"] >= 1)
    seen = context[-1] if context else {}
    return passed, "session memory", (result or {}).get("allowed"), [f"turns={seen.get('turns')}", f"tokens={seen.get('prompt_tokens')}"], reply[:50]
