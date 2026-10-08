# Serves everything the harness remembers about the person asking, newest first.
from common.send_json import send_json


def get_facts(handler, query, owner, deps):
    send_json(handler, 200, {"facts": deps["memory"].listing(owner)}, deps["origin"])
