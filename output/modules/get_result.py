# Serves a finished task result, or reports that it is not ready yet.
from common.send_json import send_json
from output.modules.load_result import load_result


def get_result(handler, query, owner, deps):
    body = load_result(deps["folder"], query["session"], query["task"])
    send_json(handler, 200, body, deps["origin"])
