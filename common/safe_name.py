# True when a value is a string matching the allowed name pattern.
import re


def safe_name(value, pattern):
    if not isinstance(value, str):
        return False
    return re.fullmatch(pattern, value) is not None
