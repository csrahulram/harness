# Returns cached blocks and moves every other model off the GPU before a heavy one runs.
import gc

import torch


def make_room(agents, keep, needed_gb):
    freed = []
    if torch.cuda.mem_get_info()[0] / 1e9 < needed_gb:
        for name, agent in agents.items():
            if name != keep and agent.state.get("on_gpu"):
                agent.unload()
                freed.append(name)
    gc.collect()
    torch.cuda.empty_cache()
    return freed
