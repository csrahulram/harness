# Pulls one lasting fact out of what the person said, guards it, and stores it unless it is already known.
import time

from agents.memory_keeper.modules.extract_fact import extract_fact
from agents.memory_keeper.modules.guard_fact import guard_fact
from agents.memory_keeper.modules.is_durable import is_durable
from agents.memory_keeper.modules.worth_reading import worth_reading
from common.embed_text import embed_text
from common.make_record import make_record
from memory import main as memory


def run(task, state, settings):
    start = time.perf_counter()
    agent = settings["agent"]
    model = settings["model"]
    said = task.get("previous") or {}
    reply = said.get("text", "")
    user = task.get("user")
    if not said.get("allowed"):
        return make_record(False, settings["blocked_reason"], agent, model, start, text=reply, kept=None)
    if not user:
        return make_record(True, settings["no_user_reason"], agent, model, start, text=reply, kept=None)
    if not worth_reading(task["text"], settings["skip_endings"]):
        return make_record(True, "nothing worth keeping", agent, model, start, text=reply, kept=None)
    fact = extract_fact(state, task["text"], settings)
    nothing = settings["nothing_word"] in fact.upper()
    if not fact or nothing or not is_durable(fact, settings["skip_phrases"]):
        return make_record(True, "nothing worth keeping", agent, model, start, text=reply, kept=None)
    score = guard_fact(state, fact, settings)
    if score > settings["threshold"]:
        return make_record(True, "refused a risky fact", agent, model, start, text=reply, kept=None,
                           refused={"fact": fact, "score": round(score, 4)})
    vector = embed_text(state, fact, settings["device"])
    stored = memory.remember(user, task["session"], fact, task["text"], vector)
    reason = "remembered" if stored else "already known"
    return make_record(True, reason, agent, model, start, text=reply,
                       kept={"fact": fact, "stored": stored, "score": round(score, 4)})
