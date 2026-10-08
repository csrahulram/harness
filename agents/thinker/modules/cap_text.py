# Trims a note to a token budget so a long one can never crowd out the conversation.
def cap_text(tokenizer, text, budget):
    ids = tokenizer(text).input_ids
    if len(ids) <= budget:
        return text, len(ids)
    return tokenizer.decode(ids[:budget]), budget
