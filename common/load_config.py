# Reads the root config.json and resolves its folder paths against the project root.
import json
from pathlib import Path


def load_config(root):
    root = Path(root)
    text = (root / "config.json").read_text(encoding="utf-8")
    config = json.loads(text)
    config["root"] = root
    for name, folder in config["paths"].items():
        config["paths"][name] = root / folder
    return config
