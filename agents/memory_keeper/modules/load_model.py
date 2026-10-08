# Loads the small extractor, the guard that checks what it writes, and the embedding model.
import torch
from transformers import AutoModelForCausalLM
from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer

from common.embed_model import embed_model


def load_model(paths, device, dtype):
    tokenizer = AutoTokenizer.from_pretrained(paths["model"])
    model = AutoModelForCausalLM.from_pretrained(paths["model"], dtype=getattr(torch, dtype))
    guard_tokenizer = AutoTokenizer.from_pretrained(paths["guard"])
    guard = AutoModelForSequenceClassification.from_pretrained(paths["guard"])
    state = {
        "tokenizer": tokenizer,
        "model": model.to(device).eval(),
        "guard_tokenizer": guard_tokenizer,
        "guard": guard.to(device).eval(),
    }
    state.update(embed_model(paths["embed"], device))
    return state
