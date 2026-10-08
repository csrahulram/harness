# Moves models that have sat unused on the GPU off to RAM; zero seconds means never move them.
import time


def free_idle(agents, last_used, idle_seconds):
    freed = []
    if idle_seconds <= 0:
        return freed
    for name, agent in agents.items():
        idle = time.perf_counter() - last_used.get(name, 0)
        if agent.state.get("on_gpu") and idle > idle_seconds:
            agent.unload()
            freed.append(name)
    return freed
