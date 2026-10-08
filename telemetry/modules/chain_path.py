# Path of a session's chain file.
def chain_path(folder, session):
    return folder / (session + ".jsonl")
