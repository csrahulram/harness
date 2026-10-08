# Builds the call function workflows use: load, run, check shape and record the step.
import time

from common.check_shape import check_shape
from workflows.modules.brief_task import brief_task
from workflows.modules.ensure_loaded import ensure_loaded
from workflows.modules.make_room import make_room


def make_call(agents, telemetry, shape, folders, timeout, pause, last_used, verify):
    def call(name, task):
        agent = agents[name]
        session = task["session"]
        task = {
            **task,
            "output_folder": str(folders["output"] / session),
            "input_folder": str(folders["input"] / session),
            "history": telemetry.turns(session, task["task"]),
            "memory_folder": str(folders["memory"]),
        }
        started = time.perf_counter()
        freed = make_room(agents, name, agent.SETTINGS["gpu_gb"])
        resources = ensure_loaded(agent, timeout, pause, verify)
        resources["freed"] = freed
        waited = time.perf_counter() - started
        record = check_shape(agent.run(task), shape, name)
        last_used[name] = time.perf_counter()
        status = "ok" if record["allowed"] else "blocked"
        validation = {
            "allowed": record["allowed"],
            "reason": record["reason"],
            "resources": resources,
            "wait_seconds": round(waited, 3),
        }
        telemetry.add_step(session, name, validation, brief_task(task), record, record["seconds"], status)
        return record

    return call
