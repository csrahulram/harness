# Gathers the notes and the remembered facts that match this message, for the next step to use.
import time

from common.embed_text import embed_text
from common.make_record import make_record
from memory import main as memory


def run(task, state, settings):
    start = time.perf_counter()
    agent = settings["agent"]
    model = settings["model"]
    user = task.get("user")
    if not user:
        return make_record(False, settings["no_user_reason"], agent, model, start, memory={}, facts=[])
    notes = memory.read(user)
    held = {name: text for name, text in notes.items() if text}
    vector = embed_text(state, task["text"], settings["device"])
    facts = memory.recall(user, vector)
    return make_record(True, "ok", agent, model, start, memory=held, facts=facts)
