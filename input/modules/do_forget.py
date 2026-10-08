# Forgets one remembered fact, provided it belongs to the person asking.
import json

from memory import main as memory


def do_forget(raw, deps, owner):
    try:
        body = json.loads(raw)
    except ValueError:
        return 400, {"error": deps["bad_forget"]}
    wanted = body.get("id") if isinstance(body, dict) else None
    if not isinstance(wanted, int):
        return 400, {"error": deps["bad_forget"]}
    if not memory.forget(owner, wanted):
        return 404, {"error": deps["bad_forget"]}
    return 200, {"forgotten": wanted}
