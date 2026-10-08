# Yields task files in input that have no result in output yet.
def find_waiting(input_folder, output_folder):
    for source in sorted(input_folder.glob("*/*.json")):
        target = output_folder / source.parent.name / source.name
        if not target.exists():
            yield source, target
