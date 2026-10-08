# Loads the entailment model that decides whether a reply supports a claim.
from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer


def load_judge(path, device):
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path)
    labels = {index: name.lower() for index, name in model.config.id2label.items()}
    return {"tokenizer": tokenizer, "model": model.to(device).eval(), "labels": labels}
