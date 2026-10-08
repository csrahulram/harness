# The text of a note, or nothing at all when it has not been written yet.
def read_note(path):
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8").strip()
