# Polls the result route until the task is done or the timeout passes.
import time

from tests.modules.fetch_json import fetch_json


def wait_result(url, session, task, timeout, pause, token=None):
    deadline = time.perf_counter() + timeout
    while time.perf_counter() < deadline:
        answer = fetch_json(url, "/result", token, session=session, task=task)
        if answer.get("ready"):
            return answer["result"]
        time.sleep(pause)
    return None
