# Asks the small model for one lasting fact about the person, or nothing at all.
import torch


def extract_fact(state, exchange, settings):
    messages = [
        {"role": "system", "content": settings["system_prompt"]},
        {"role": "user", "content": exchange},
    ]
    prompt = state["tokenizer"].apply_chat_template(
        messages, add_generation_prompt=True, enable_thinking=False,
        return_tensors="pt", return_dict=True,
    ).to(settings["device"])
    with torch.no_grad():
        ids = state["model"].generate(
            **prompt, max_new_tokens=settings["max_new_tokens"], do_sample=False
        )
    said = state["tokenizer"].decode(ids[0, prompt["input_ids"].shape[1]:], skip_special_tokens=True)
    return said.strip().strip('"').split("\n")[0].strip()
