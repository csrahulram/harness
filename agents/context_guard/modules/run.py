# Runs the guard on a task and returns the shared record shape with a score.
import time

from agents.context_guard.modules.split_text import split_text
from agents.context_guard.modules.worst_score import worst_score
from common.make_record import make_record


def run(task, state, settings):
    start = time.perf_counter()
    tokenizer = state["tokenizer"]
    windows = split_text(tokenizer, task["text"], settings["window"], settings["device"])
    score = worst_score(state["model"], windows, settings["injection_label"], settings["batch"])
    allowed = score <= settings["threshold"]
    reason = "ok" if allowed else settings["blocked_reason"]
    agent = settings["agent"]
    model = settings["model"]
    return make_record(allowed, reason, agent, model, start, score=round(score, 4))
