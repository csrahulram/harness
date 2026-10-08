# Recall agent entry: holds the embedding model and exposes load, unload and run.
import sys
from pathlib import Path

ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT))

from agents.memory_recall.modules.run import run as run_recall
from common.embed_model import embed_model
from common.load_config import load_config
from common.read_json import read_json

FOLDER = Path(__file__).parent
CONFIG = load_config(ROOT)
SETTINGS = read_json(FOLDER / "config.json")
MODEL_PATH = CONFIG["paths"]["models"] / SETTINGS["model"]

state = {}


def load():
    if "embedder" not in state:
        state.update(embed_model(MODEL_PATH, SETTINGS["device"]))
    state["on_gpu"] = True


def unload():
    state["on_gpu"] = False


def run(task):
    return run_recall(task, state, SETTINGS)
