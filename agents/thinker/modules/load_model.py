# Loads the Qwen3 chat model and tokenizer in the configured precision.
import torch
from transformers import AutoModelForCausalLM
from transformers import AutoTokenizer


def load_model(path, device, dtype):
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForCausalLM.from_pretrained(path, dtype=getattr(torch, dtype))
    model = model.to(device).eval()
    return {"tokenizer": tokenizer, "model": model}
