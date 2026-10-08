# Serves the notes the harness keeps about the person asking.
from common.send_json import send_json


def get_memory(handler, query, owner, deps):
    send_json(handler, 200, {"notes": deps["memory"].read(owner)}, deps["origin"])
