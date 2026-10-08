# Finds a session file among the generated results or the uploaded inputs.
def find_file(output_folder, input_folder, session, name):
    places = [output_folder / session / name, input_folder / session / "files" / name]
    for path in places:
        if path.is_file():
            return path
    return None
