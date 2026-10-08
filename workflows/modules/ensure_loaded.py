# Puts a model on the GPU if needed and reports any drift in its weights.
import torch

from common.fingerprint import fingerprint
from workflows.modules.check_weights import check_weights
from workflows.modules.wait_for_gpu import wait_for_gpu


def ensure_loaded(agent, timeout, pause, verify):
    free_now = torch.cuda.mem_get_info()[0] / 1e9
    if agent.state.get("on_gpu"):
        on_card = agent.SETTINGS["device"] == "cuda"
        checking = verify and on_card and "model" in agent.state
        weights = check_weights(agent) if checking else {"ok": True, "drift": 0}
        if "fingerprint" in weights:
            agent.state["fingerprint"] = weights["fingerprint"]
        return {
            "gpu_free_gb": round(free_now, 2),
            "allocated_gb": round(torch.cuda.memory_allocated() / 1e9, 2),
            "reserved_gb": round(torch.cuda.memory_reserved() / 1e9, 2),
            "weights": "ok" if weights["ok"] else "drifted",
            "drift": weights["drift"],
        }
    free = wait_for_gpu(agent.SETTINGS["gpu_gb"], timeout, pause)
    agent.load()
    if "model" in agent.state:
        agent.state["fingerprint"] = fingerprint(agent.state["model"])
    return {
        "gpu_free_gb": round(torch.cuda.mem_get_info()[0] / 1e9, 2),
        "waited_free_gb": round(free, 2),
        "allocated_gb": round(torch.cuda.memory_allocated() / 1e9, 2),
        "reserved_gb": round(torch.cuda.memory_reserved() / 1e9, 2),
        "needed_gb": agent.SETTINGS["gpu_gb"],
        "weights": "loaded",
        "drift": 0,
    }
