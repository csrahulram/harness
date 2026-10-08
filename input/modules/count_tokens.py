# Counts how many tokens a text becomes.
def count_tokens(tokenizer, text):
    return len(tokenizer.encode(text).ids)
