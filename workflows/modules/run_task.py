# Runs one task through its workflow and turns the outcome into a result record.
from workflows.modules.finish import finish
from workflows.modules.run_steps import run_steps


def run_task(task, workflows, call, telemetry, replies):
    session = task["session"]
    steps = workflows.get(task["mode"])
    if steps is None:
        telemetry.add_end(session, "error", replies["unknown_mode_reply"])
        return finish(task, False, replies["unknown_mode_reply"], [], "unknown mode")
    try:
        outcome = run_steps(task, call, steps)
    except Exception as error:
        telemetry.add_end(session, "error", str(error))
        return finish(task, False, replies["error_reply"], [], str(error))
    if not outcome["allowed"]:
        stopper = outcome["steps"][-1]
        telemetry.add_end(session, stopper["agent"], stopper["reason"])
        reply = replies["blocked_reply"] if stopper["agent"] == "context_guard" else stopper["reason"]
        return finish(task, False, reply, outcome["steps"], None)
    reply = outcome["reply"] or replies["no_answer_reply"]
    return finish(task, True, reply, outcome["steps"], None)
