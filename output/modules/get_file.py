# Serves one file from a session: an upload that went in, or something a model made.
from common.send_file import send_file
from common.send_json import send_json
from output.modules.find_file import find_file
from output.modules.parse_query import parse_query


def get_file(handler, query, owner, deps):
    name = parse_query(handler.path, deps["file_pattern"], ["name"])
    if name is None:
        send_json(handler, 400, {"error": "need a file name"}, deps["origin"])
        return
    path = find_file(deps["folder"], deps["input_folder"], query["session"], name["name"])
    if path is None:
        send_json(handler, 404, {"error": "no such file"}, deps["origin"])
        return
    kind = deps["media_types"].get(path.suffix.lstrip("."), "application/octet-stream")
    send_file(handler, path, kind, deps["origin"])
