# Loads a finished task result, or reports that it is not ready.
from common.read_json import read_json


def load_result(folder, session, task):
    path = folder / session / (task + ".json")
    if not path.exists():
        return {"ready": False}
    return {"ready": True, "result": read_json(path)}
