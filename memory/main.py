# Memory entry: the notes a person writes, and the facts the harness remembers about them.
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.connect_db import connect_db
from common.load_config import load_config
from memory.modules.add_memory import add_memory
from memory.modules.drop_memory import drop_memory
from memory.modules.find_memories import find_memories
from memory.modules.list_memories import list_memories
from memory.modules.read_note import read_note
from memory.modules.same_memory import same_memory
from memory.modules.user_folder import user_folder
from memory.modules.write_note import write_note

CONFIG = load_config(ROOT)
FOLDER = CONFIG["paths"]["memory"]
RECALL = CONFIG["recall"]
NOTES = ("profile", "soul")

connection = connect_db(CONFIG["database"])


def read(user):
    folder = user_folder(FOLDER, user)
    return {name: read_note(folder / f"{name}.md") for name in NOTES}


def write(user, notes):
    folder = user_folder(FOLDER, user)
    return {name: write_note(folder / f"{name}.md", notes.get(name, "")) for name in NOTES}


def remember(user, session, text, source, vector):
    if same_memory(connection, user, vector, RECALL["same_distance"]):
        return False
    add_memory(connection, user, session, "fact", text, source, vector)
    return True


def recall(user, vector):
    return find_memories(connection, user, vector, RECALL["limit"], RECALL["furthest"])


def listing(user):
    return list_memories(connection, user, RECALL["listing_limit"])


def forget(user, memory_id):
    return drop_memory(connection, user, memory_id)
