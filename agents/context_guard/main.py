# Guard agent entry: reads config, keeps model state, exposes load, unload and run.
import sys
from pathlib import Path

ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT))

from agents.context_guard.modules.load_model import load_model
from agents.context_guard.modules.run import run as run_guard
from common.free_gpu import free_gpu
from common.load_config import load_config
from common.place_model import place_model
from common.read_json import read_json

FOLDER = Path(__file__).parent
CONFIG = load_config(ROOT)
SETTINGS = read_json(FOLDER / "config.json")
MODEL_PATH = CONFIG["paths"]["models"] / SETTINGS["model"]

state = {}


def load():
    place_model(state, SETTINGS["device"], lambda: load_model(MODEL_PATH, SETTINGS["device"]))


def unload():
    free_gpu(state)


def run(task):
    return run_guard(task, state, SETTINGS)
