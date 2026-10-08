# Runs the thinker on a guarded task, with the session's earlier exchanges for context.
import time
from pathlib import Path

from agents.thinker.modules.answer_only import answer_only
from agents.thinker.modules.build_messages import build_messages
from agents.thinker.modules.build_prompt import build_prompt
from agents.thinker.modules.build_system import build_system
from agents.thinker.modules.stream_generate import stream_generate
from agents.thinker.modules.trim_history import trim_history
from common.make_record import make_record


def run(task, state, settings):
    start = time.perf_counter()
    agent = settings["agent"]
    model_name = settings["model"]
    guard = task.get("previous")
    if guard is None:
        return make_record(False, settings["no_guard_reason"], agent, model_name, start, text="")
    if not guard["allowed"]:
        return make_record(False, settings["blocked_reason"], agent, model_name, start, text="")
    tokenizer = state["tokenizer"]
    caps = {
        "soul": settings["soul_tokens"],
        "profile": settings["profile_tokens"],
        "facts": settings["fact_tokens"],
    }
    system, remembered = build_system(tokenizer, settings, guard, caps)
    kept, used = trim_history(
        tokenizer, system, task.get("history") or [], task["text"], settings["prompt_tokens"]
    )
    messages = build_messages(system, kept, task["text"])
    prompt = build_prompt(tokenizer, messages, settings["enable_thinking"], settings["device"])
    stream_name = task["task"] + settings["stream_suffix"]
    raw = stream_generate(
        tokenizer,
        state["model"],
        prompt,
        settings["max_new_tokens"],
        Path(task["output_folder"]) / stream_name,
        settings["end_of_thinking"],
        settings["stream_timeout_seconds"],
    )
    text = answer_only(raw, settings["end_of_thinking"])
    context = {
        "turns": len(kept) // 2,
        "dropped": (len(task.get("history") or []) - len(kept)) // 2,
        "prompt_tokens": used,
        "budget": settings["prompt_tokens"],
        "remembered": remembered,
    }
    return make_record(True, "ok", agent, model_name, start, text=text, files=[stream_name], context=context)
