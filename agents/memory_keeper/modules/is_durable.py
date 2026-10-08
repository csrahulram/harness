# False when the sentence only echoes a question, or is left incomplete with a placeholder.
def is_durable(fact, skip_phrases):
    lowered = fact.lower().strip()
    if not lowered:
        return False
    return not any(phrase in lowered for phrase in skip_phrases)
