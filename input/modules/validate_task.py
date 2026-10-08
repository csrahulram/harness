# Checks text length and token count against the limits and returns the validation record.
def validate_task(task, tokens, max_chars, token_limit, too_long):
    chars = len(task["text"])
    ok = chars <= max_chars and tokens <= token_limit
    return {
        "ok": ok,
        "reason": "ok" if ok else too_long,
        "chars": chars,
        "max_chars": max_chars,
        "tokens": tokens,
        "token_limit": token_limit,
    }
