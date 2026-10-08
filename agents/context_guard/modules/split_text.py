# Cuts long text into overlapping token windows the classifier can read.
def split_text(tokenizer, text, window, device):
    windows = tokenizer(
        text,
        truncation=True,
        max_length=window,
        stride=window // 4,
        padding=True,
        return_overflowing_tokens=True,
        return_tensors="pt",
    )
    windows.pop("overflow_to_sample_mapping", None)
    windows.pop("token_type_ids", None)
    return windows.to(device)
