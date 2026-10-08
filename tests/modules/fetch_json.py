# GET a JSON route with query values and an optional token.
import json
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request
from urllib.request import urlopen


def fetch_json(url, route, token=None, **query):
    headers = {"X-Token": token} if token else {}
    request = Request(url + route + "?" + urlencode(query), headers=headers)
    try:
        with urlopen(request) as response:
            return json.loads(response.read())
    except HTTPError as error:
        return {"error": json.loads(error.read()).get("error"), "status": error.code}
