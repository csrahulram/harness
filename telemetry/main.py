# Telemetry entry: the session chain in files, and who owns each session in the database.
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.check_shape import check_shape
from common.connect_db import connect_db
from common.load_config import load_config
from common.now import now
from telemetry.modules.chain_path import chain_path
from telemetry.modules.close_session import close_session
from telemetry.modules.list_sessions import list_sessions
from telemetry.modules.make_end import make_end
from telemetry.modules.make_step import make_step
from telemetry.modules.make_turns import make_turns
from telemetry.modules.name_once import name_once
from telemetry.modules.name_session import name_session
from telemetry.modules.owner_of import owner_of
from telemetry.modules.read_chain import read_chain
from telemetry.modules.record import record
from telemetry.modules.touch_session import touch_session

CONFIG = load_config(ROOT)
FOLDER = CONFIG["paths"]["telemetry"]
SHAPE = CONFIG["shapes"]["step"]

connection = connect_db(CONFIG["database"])


def read(session):
    return read_chain(chain_path(FOLDER, session))


def turns(session, skip_task):
    return make_turns(read(session), skip_task)


def start(session, owner):
    touch_session(connection, session, owner)


def rename(session, name):
    name_session(connection, session, name)


def name_new(session, name):
    name_once(connection, session, name)


def close(session):
    close_session(connection, session)


def sessions(owner):
    return list_sessions(connection, owner)


def owner(session):
    return owner_of(connection, session)


def add_step(session, agent, validation, task_input, output, seconds, status):
    chain = read(session)
    entry = make_step(chain, agent, validation, task_input, output, seconds, status)
    check_shape(entry, SHAPE, "step")
    return record(chain_path(FOLDER, session), entry)


def add_end(session, by, reason):
    chain = read(session)
    entry = make_end(chain, by, reason, now())
    check_shape(entry, SHAPE, "step")
    return record(chain_path(FOLDER, session), entry)
