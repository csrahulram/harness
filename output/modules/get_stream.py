# Serves the part of a reply written so far, so the page can show it as it arrives.
from common.send_json import send_json
from output.modules.load_stream import load_stream


def get_stream(handler, query, owner, deps):
    body = load_stream(deps["folder"], query["session"], query["task"], deps["stream_suffix"])
    send_json(handler, 200, body, deps["origin"])
