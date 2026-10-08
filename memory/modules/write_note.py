# Saves a note, removing it when the person clears the text.
def write_note(path, text):
    cleaned = (text or "").strip()
    if not cleaned:
        path.unlink(missing_ok=True)
        return ""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(cleaned + "\n", encoding="utf-8")
    return cleaned
