# Validates a task from a signed in person and saves it for the workflows.
from input.modules.accept_task import accept_task
from input.modules.parse_task import parse_task
from input.modules.start_session import start_session


def do_task(raw, started, deps, owner):
    task = parse_task(raw, deps["pattern"], deps["default_mode"])
    if task is None:
        return 400, {"error": deps["bad_request"]}
    task["user"] = owner
    start_session(deps["telemetry"], task["session"], owner, task["text"], deps["name_chars"])
    return accept_task(task, started, deps)
