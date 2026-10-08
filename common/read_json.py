# Reads a JSON file into a dict.
import json


def read_json(path):
    text = path.read_text(encoding="utf-8")
    return json.loads(text)
