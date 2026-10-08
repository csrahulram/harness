# Puts one question to the thinker with a given system message and returns what it said.
import torch

from agents.thinker.modules.answer_only import answer_only
from agents.thinker.modules.build_messages import build_messages
from agents.thinker.modules.build_prompt import build_prompt


def ask_thinker(state, system, question, settings):
    messages = build_messages(system, [], question)
    prompt = build_prompt(state["tokenizer"], messages, settings["enable_thinking"], settings["device"])
    with torch.no_grad():
        ids = state["model"].generate(
            **prompt, max_new_tokens=settings["max_new_tokens"], do_sample=False
        )
    said = state["tokenizer"].decode(ids[0, prompt["input_ids"].shape[1]:], skip_special_tokens=True)
    return answer_only(said, settings["end_of_thinking"])
