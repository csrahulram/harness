# Workflow runner: picks up tasks, runs the workflow for their mode, frees idle models.
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.check_shape import check_shape
from common.load_config import load_config
from common.read_json import read_json
from common.write_json import write_json
from telemetry import main as telemetry
from workflows.modules.find_waiting import find_waiting
from workflows.modules.free_idle import free_idle
from workflows.modules.load_module import load_module
from workflows.modules.load_steps import load_steps
from workflows.modules.make_call import make_call
from workflows.modules.run_task import run_task

FOLDER = Path(__file__).parent
CONFIG = load_config(ROOT)
SETTINGS = read_json(FOLDER / "config.json")
LIMITS = CONFIG["limits"]
SHAPES = CONFIG["shapes"]

WORKFLOWS = load_steps(FOLDER, SETTINGS["modes"])
AGENT_NAMES = {name for steps in WORKFLOWS.values() for name in steps}
AGENTS = {name: load_module("agents", name) for name in AGENT_NAMES}
LAST_USED = {}

call = make_call(
    AGENTS,
    telemetry,
    SHAPES["record"],
    {
        "input": CONFIG["paths"]["input"],
        "output": CONFIG["paths"]["output"],
        "memory": CONFIG["paths"]["memory"],
    },
    LIMITS["gpu_wait_seconds"],
    LIMITS["pause_seconds"],
    LAST_USED,
    LIMITS["verify_weights"],
)


def work():
    for source, target in find_waiting(CONFIG["paths"]["input"], CONFIG["paths"]["output"]):
        task = check_shape(read_json(source), SHAPES["task"], "task")
        result = run_task(task, WORKFLOWS, call, telemetry, SETTINGS)
        write_json(target, check_shape(result, SHAPES["result"], "result"))
        print(task["session"], task["task"], result["allowed"], flush=True)


def tidy():
    for name in free_idle(AGENTS, LAST_USED, LIMITS["gpu_idle_seconds"]):
        print("moved", name, "off the GPU after", LIMITS["gpu_idle_seconds"], "s idle", flush=True)


def loop():
    print("workflows watching", CONFIG["paths"]["input"], flush=True)
    try:
        while True:
            work()
            tidy()
            time.sleep(LIMITS["pause_seconds"])
    except KeyboardInterrupt:
        print("workflows stopped")


if __name__ == "__main__":
    loop()
