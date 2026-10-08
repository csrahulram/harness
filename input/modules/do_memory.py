# Saves the notes a person keeps about themselves, and says how much of each the model will read.
import json

from input.modules.count_tokens import count_tokens
from memory import main as memory


def do_memory(raw, deps, owner):
    try:
        body = json.loads(raw)
    except ValueError:
        return 400, {"error": deps["bad_memory"]}
    if not isinstance(body, dict):
        return 400, {"error": deps["bad_memory"]}
    notes = {name: body.get(name, "") for name in ("profile", "soul")}
    if any(not isinstance(text, str) or len(text) > deps["max_chars"] for text in notes.values()):
        return 400, {"error": deps["bad_memory"]}
    saved = memory.write(owner, notes)
    counts = {name: count_tokens(deps["tokenizer"], text) for name, text in saved.items()}
    return 200, {"notes": saved, "tokens": counts, "caps": deps["note_caps"]}
