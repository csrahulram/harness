# Moves a loaded model off the GPU into system RAM and frees the GPU memory it held.
import gc

import torch


def free_gpu(state):
    if "model" in state:
        state["model"].to("cpu")
    state["on_gpu"] = False
    gc.collect()
    torch.cuda.empty_cache()
