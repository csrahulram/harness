# Counts the tokens a list of chat messages becomes once the template is applied.
def count_prompt(tokenizer, messages):
    text = tokenizer.apply_chat_template(messages, add_generation_prompt=True, tokenize=False)
    return len(tokenizer(text).input_ids)
