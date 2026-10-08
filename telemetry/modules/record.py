# Appends one record as a JSON line to a chain file.
import json


def record(path, entry):
    path.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(entry) + "\n"
    with path.open("a", encoding="utf-8") as chain:
        chain.write(line)
    return entry
