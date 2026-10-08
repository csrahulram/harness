# Turns a session chain into the user and assistant exchanges it recorded, newest last.
def make_turns(chain, skip_task):
    turns = []
    pending = None
    for entry in chain:
        if entry["agent"] == "input" and entry["status"] == "ok":
            same = (entry["output"] or {}).get("task") == skip_task
            pending = None if same else entry["input"]["text"]
        elif entry["agent"] == "thinker" and entry["status"] == "ok" and pending is not None:
            turns.append({"role": "user", "text": pending})
            turns.append({"role": "assistant", "text": entry["output"]["text"]})
            pending = None
    return turns
