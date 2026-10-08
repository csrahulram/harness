# Assembles the system message, the kept exchanges and the new message into chat messages.
def build_messages(system, history, text):
    messages = [{"role": "system", "content": system}]
    for turn in history:
        messages.append({"role": turn["role"], "content": turn["text"]})
    messages.append({"role": "user", "content": text})
    return messages
