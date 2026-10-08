# Serves the open sessions belonging to the person asking.
from common.send_json import send_json


def get_sessions(handler, query, owner, deps):
    send_json(handler, 200, {"sessions": deps["telemetry"].sessions(owner)}, deps["origin"])
