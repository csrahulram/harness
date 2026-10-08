# False when the person only asked something, so there is no statement to learn from.
def worth_reading(text, skip_endings):
    stripped = text.strip()
    return bool(stripped) and not any(stripped.endswith(end) for end in skip_endings)
