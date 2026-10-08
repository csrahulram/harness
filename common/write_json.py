# Writes a dict as JSON through a temp file so readers never see a half-written file.
import json
import os


def write_json(path, record):
    path.parent.mkdir(parents=True, exist_ok=True)
    draft = path.with_suffix(".tmp")
    draft.write_text(json.dumps(record), encoding="utf-8")
    os.replace(draft, path)
