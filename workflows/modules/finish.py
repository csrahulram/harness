# Builds the result record for a task.
def finish(task, allowed, reply, steps, error):
    return {
        "session": task["session"],
        "task": task["task"],
        "allowed": allowed,
        "reply": reply,
        "steps": steps,
        "error": error,
    }
