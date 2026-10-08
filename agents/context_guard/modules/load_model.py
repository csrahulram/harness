# Loads the prompt-injection classifier and its tokenizer onto the device.
from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer


def load_model(path, device):
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path)
    model = model.to(device).eval()
    return {"tokenizer": tokenizer, "model": model}
