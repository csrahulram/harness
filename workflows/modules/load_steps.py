# Builds the mode to step list registry by reading every workflow's main.md.
from workflows.modules.read_steps import read_steps


def load_steps(folder, modes):
    return {mode: read_steps(folder / name / "main.md") for mode, name in modes.items()}
