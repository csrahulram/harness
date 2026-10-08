# Turns chat messages into the prompt tensors the model reads.
def build_prompt(tokenizer, messages, enable_thinking, device):
    prompt = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        enable_thinking=enable_thinking,
        return_tensors="pt",
        return_dict=True,
    )
    return prompt.to(device)
