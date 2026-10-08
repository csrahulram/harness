# Reads the ordered agent names from a workflow's main.md numbered list.
import re

STEP = re.compile(r"^\s*\d+\.\s*([A-Za-z0-9_]+)\s*$", re.M)


def read_steps(path):
    text = path.read_text(encoding="utf-8")
    steps = STEP.findall(text)
    if not steps:
        raise ValueError(f"{path} lists no steps")
    return steps
