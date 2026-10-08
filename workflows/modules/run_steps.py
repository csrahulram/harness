# Runs a workflow's agents in the order its main.md gives, stopping at the first refusal.
from workflows.modules.pick_reply import pick_reply


def run_steps(task, call, steps):
    records = []
    for name in steps:
        previous = records[-1] if records else None
        record = call(name, {**task, "previous": previous})
        records.append(record)
        if not record["allowed"]:
            return {"allowed": False, "reply": None, "steps": records}
    return {"allowed": True, "reply": pick_reply(records), "steps": records}
