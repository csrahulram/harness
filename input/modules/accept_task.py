# Validates a task, records the input step in the chain and saves it for the workflows.
import time

from common.check_shape import check_shape
from common.write_json import write_json
from input.modules.count_tokens import count_tokens
from input.modules.new_task_id import new_task_id
from input.modules.validate_task import validate_task


def accept_task(task, start, deps):
    task["task"] = new_task_id()
    check_shape(task, deps["shape"], "task")
    tokens = count_tokens(deps["tokenizer"], task["text"])
    validation = validate_task(task, tokens, deps["max_chars"], deps["token_limit"], deps["too_long"])
    status = "ok" if validation["ok"] else "rejected"
    output = {"task": task["task"]} if validation["ok"] else {"error": validation["reason"]}
    telemetry = deps["telemetry"]
    telemetry.add_step(task["session"], "input", validation, task, output, time.perf_counter() - start, status)
    if not validation["ok"]:
        telemetry.add_end(task["session"], "validation", validation["reason"])
        return 400, {"error": validation["reason"], "validation": validation}
    write_json(deps["folder"] / task["session"] / (task["task"] + ".json"), task)
    return 200, {"session": task["session"], "task": task["task"], "validation": validation}
