# Imports an agent or workflow by folder name.
import importlib


def load_module(kind, name):
    return importlib.import_module(f"{kind}.{name}.main")
