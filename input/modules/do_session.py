# Renames or closes a session, provided it belongs to the person asking.
from input.modules.parse_session import parse_session
from input.modules.update_session import update_session


def do_session(raw, deps, owner):
    request = parse_session(raw, deps["pattern"], deps["max_name_chars"])
    if request is None:
        return 400, {"error": deps["bad_session"]}
    held = deps["telemetry"].owner(request["session"])
    if held is not None and held != owner:
        return 403, {"error": deps["not_yours"]}
    return 200, update_session(deps["telemetry"], request, owner)
