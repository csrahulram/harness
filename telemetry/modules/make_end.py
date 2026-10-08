# Builds the termination record that closes a chain.
def make_end(chain, by, reason, time):
    prev = chain[-1]["step"] if chain else None
    return {
        "step": len(chain) + 1,
        "prev": prev,
        "agent": "end",
        "validation": None,
        "input": None,
        "output": {"by": by, "reason": reason, "time": time},
        "seconds": 0,
        "status": "end",
    }
