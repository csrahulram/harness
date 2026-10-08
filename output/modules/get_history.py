# Serves a session's chain, which is every step the harness took in it.
from common.send_json import send_json


def get_history(handler, query, owner, deps):
    send_json(handler, 200, {"chain": deps["telemetry"].read(query["session"])}, deps["origin"])
