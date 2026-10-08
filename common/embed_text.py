# Turns text into one normalised vector by averaging the tokens the model produced.
import torch


def embed_text(state, text, device):
    tokens = state["embed_tokenizer"](
        text, return_tensors="pt", truncation=True, max_length=256, padding=True
    ).to(device)
    with torch.no_grad():
        output = state["embedder"](**tokens).last_hidden_state
    mask = tokens["attention_mask"].unsqueeze(-1).float()
    pooled = (output * mask).sum(1) / mask.sum(1).clamp(min=1e-9)
    return torch.nn.functional.normalize(pooled, dim=-1)[0].tolist()
