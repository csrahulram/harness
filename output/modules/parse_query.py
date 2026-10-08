# Reads the named query values from a URL and checks they are safe names.
from urllib.parse import parse_qs
from urllib.parse import urlparse

from common.safe_name import safe_name


def parse_query(url, pattern, keys):
    query = parse_qs(urlparse(url).query)
    names = {key: query.get(key, [""])[0] for key in keys}
    if not all(safe_name(value, pattern) for value in names.values()):
        return None
    return names
