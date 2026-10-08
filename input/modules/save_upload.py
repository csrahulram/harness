# Writes an uploaded file into the session's files folder under a fresh name.
def save_upload(folder, upload, file_id):
    name = file_id + "." + upload["suffix"]
    target = folder / upload["session"] / "files" / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(upload["data"])
    return {"session": upload["session"], "file": name, "bytes": len(upload["data"])}
