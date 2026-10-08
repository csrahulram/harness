# Waits until the GPU has the free memory a model needs, or raises on timeout.
import time

import torch


def wait_for_gpu(needed_gb, timeout, pause):
    deadline = time.perf_counter() + timeout
    while True:
        free = torch.cuda.mem_get_info()[0] / 1e9
        if free >= needed_gb:
            return free
        if time.perf_counter() > deadline:
            raise TimeoutError(f"need {needed_gb} GB on the GPU, only {free:.1f} GB free")
        torch.cuda.empty_cache()
        time.sleep(pause)
