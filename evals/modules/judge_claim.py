# Asks the entailment model whether one framed reply supports one claim, and how strongly.
import torch


def judge_claim(judge, reply, claim, settings):
    premise = settings["frame"].format(reply=reply)
    pair = judge["tokenizer"](premise, claim, return_tensors="pt", truncation=True)
    pair = pair.to(settings["device"])
    with torch.no_grad():
        scores = judge["model"](**pair).logits[0].softmax(-1)
    best = int(scores.argmax())
    return {"verdict": judge["labels"][best], "confidence": round(float(scores[best]), 3)}
