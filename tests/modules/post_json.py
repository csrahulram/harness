# POST a JSON body with an optional token, returning the status and the parsed reply.
import json
from urllib.error import HTTPError
from urllib.request import Request
from urllib.request import urlopen


def post_json(url, route, payload, token=None):
    body = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["X-Token"] = token
    request = Request(url + route, body, headers)
    try:
        with urlopen(request) as response:
            return response.status, json.loads(response.read())
    except HTTPError as error:
        return error.code, json.loads(error.read())
