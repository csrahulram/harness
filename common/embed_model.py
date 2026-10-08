# Loads the sentence embedding model, which is small enough to run on the processor.
from transformers import AutoModel
from transformers import AutoTokenizer


def embed_model(path, device):
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModel.from_pretrained(path).to(device).eval()
    return {"embedder": model, "embed_tokenizer": tokenizer}
