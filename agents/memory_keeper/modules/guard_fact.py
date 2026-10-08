# Scores a fact for prompt injection before it is ever stored and replayed into later prompts.
import torch


def guard_fact(state, text, settings):
    tokens = state["guard_tokenizer"](
        text, return_tensors="pt", truncation=True, max_length=settings["window"]
    ).to(settings["device"])
    with torch.no_grad():
        scores = state["guard"](**tokens).logits.softmax(-1)
    return scores[0, settings["injection_label"]].item()
