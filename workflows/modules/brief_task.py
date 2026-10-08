# A copy of the task small enough for the chain, with the history replaced by how many turns it held.
def brief_task(task):
    if "history" not in task:
        return task
    return {**task, "history": len(task["history"])}
