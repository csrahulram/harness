# Takes the answer from the last step that produced one: its text, or the first file it made.
def pick_reply(records):
    for record in reversed(records):
        if record.get("text"):
            return record["text"]
        if record.get("files"):
            return record["files"][0]
    return None
