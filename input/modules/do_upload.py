# Saves an uploaded file into the session's folder.
from input.modules.parse_upload import parse_upload
from input.modules.save_upload import save_upload


def do_upload(raw, deps, owner):
    upload = parse_upload(raw, deps["pattern"], deps["media_types"], deps["max_upload_bytes"])
    if upload is None:
        return 400, {"error": deps["bad_upload"]}
    held = deps["telemetry"].owner(upload["session"])
    if held is not None and held != owner:
        return 403, {"error": deps["not_yours"]}
    return 200, save_upload(deps["folder"], upload, deps["new_id"]())
