# Loads the tokenizer used to count tokens against the model limit.
from tokenizers import Tokenizer


def load_tokenizer(model_folder):
    return Tokenizer.from_file(str(model_folder / "tokenizer.json"))
