import sys
from pathlib import Path

import torch

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from workflows.modules.load_module import load_module

LONG = "Explain how a transformer model works in detail. " * 500
SAMPLES = {
    "context_guard": {"text": LONG},
    "thinker": {"text": "Write three detailed paragraphs about the sea.", "previous": {"allowed": True}},
}
BASE = {
    "session": "calibrate",
    "task": "calibrate",
    "mode": "chat",
    "files": [],
    "input_folder": str(Path(__file__).parent),
    "output_folder": str(Path(__file__).parent),
}


def measure(name):
    agent = load_module("agents", name)
    torch.cuda.empty_cache()
    torch.cuda.reset_peak_memory_stats()
    agent.load()
    weights = torch.cuda.memory_allocated() / 1e9
    record = agent.run({**BASE, **SAMPLES.get(name, {"text": "hello"})})
    peak = torch.cuda.max_memory_reserved() / 1e9
    declared = agent.SETTINGS["gpu_gb"]
    agent.unload()
    torch.cuda.empty_cache()
    return weights, peak, declared, record["seconds"]


print(f"{'agent':20} {'weights':>8} {'peak':>8} {'declared':>9} {'suggest':>8}  seconds")
for name in sys.argv[1:]:
    weights, peak, declared, seconds = measure(name)
    suggest = round(peak + 0.5, 1)
    flag = "" if declared >= peak else "  DECLARED TOO LOW"
    print(f"{name:20} {weights:7.2f}G {peak:7.2f}G {declared:8.1f}G {suggest:7.1f}G  {seconds:.1f}s{flag}", flush=True)
