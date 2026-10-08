# Reads the partial streamed answer of a task and whether the task is done.
def load_stream(folder, session, task, suffix):
    path = folder / session / (task + suffix)
    done = (folder / session / (task + ".json")).exists()
    if not path.exists():
        return {"text": "", "done": done}
    text = path.read_bytes().decode("utf-8", errors="ignore")
    return {"text": text, "done": done}
