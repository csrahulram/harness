# Drops the oldest exchanges until the prompt fits the token budget.
from agents.thinker.modules.build_messages import build_messages
from agents.thinker.modules.count_prompt import count_prompt


def trim_history(tokenizer, system, history, text, budget):
    kept = list(history)
    while True:
        messages = build_messages(system, kept, text)
        used = count_prompt(tokenizer, messages)
        if used <= budget or not kept:
            return kept, used
        kept = kept[2:]
