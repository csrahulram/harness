# Builds a step record linked to the previous step of the chain.
def make_step(chain, agent, validation, task_input, output, seconds, status):
    prev = chain[-1]["step"] if chain else None
    return {
        "step": len(chain) + 1,
        "prev": prev,
        "agent": agent,
        "validation": validation,
        "input": task_input,
        "output": output,
        "seconds": round(seconds, 3),
        "status": status,
    }
