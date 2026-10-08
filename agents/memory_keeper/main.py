# Keeper agent entry: holds the extractor, the guard and the embedder, all on the processor.
import sys
from pathlib import Path

ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT))

from agents.memory_keeper.modules.load_model import load_model
from agents.memory_keeper.modules.run import run as run_keeper
from common.load_config import load_config
from common.read_json import read_json

FOLDER = Path(__file__).parent
CONFIG = load_config(ROOT)
SETTINGS = read_json(FOLDER / "config.json")
MODELS = CONFIG["paths"]["models"]
PATHS = {
    "model": MODELS / SETTINGS["model"],
    "guard": MODELS / SETTINGS["guard_model"],
    "embed": MODELS / SETTINGS["embed_model"],
}

state = {}


def load():
    if "model" not in state:
        state.update(load_model(PATHS, SETTINGS["device"], SETTINGS["dtype"]))
    state["on_gpu"] = True


def unload():
    state["on_gpu"] = False


def run(task):
    return run_keeper(task, state, SETTINGS)
