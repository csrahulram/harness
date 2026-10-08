# Strips the thinking part and returns only the final answer text.
def answer_only(text, end_of_thinking):
    return text.split(end_of_thinking)[-1].strip()
