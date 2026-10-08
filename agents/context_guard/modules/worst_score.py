# Scores the windows in small batches and returns the highest injection probability.
import torch


def worst_score(model, windows, label, batch):
    ids = windows["input_ids"]
    mask = windows["attention_mask"]
    best = 0.0
    with torch.no_grad():
        for start in range(0, ids.shape[0], batch):
            piece = {"input_ids": ids[start:start + batch], "attention_mask": mask[start:start + batch]}
            scores = model(**piece).logits.softmax(-1)[:, label]
            best = max(best, scores.max().item())
    return best
