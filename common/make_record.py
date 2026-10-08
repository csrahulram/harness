# Builds the shared agent record: allowed, reason, agent, model, seconds plus payload.
import time


def make_record(allowed, reason, agent, model, start, **payload):
    seconds = time.perf_counter() - start
    record = {
        "allowed": allowed,
        "reason": reason,
        "agent": agent,
        "model": model,
        "seconds": round(seconds, 3),
    }
    record.update(payload)
    return record
