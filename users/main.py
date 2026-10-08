# Accounts entry: signing up, signing in and out, checking a token, deleting a profile.
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.connect_db import connect_db
from common.load_config import load_config
from users.modules.check_password import check_password
from users.modules.drop_account import drop_account
from users.modules.drop_token import drop_token
from users.modules.make_account import make_account
from users.modules.make_token import make_token
from users.modules.read_token import read_token

CONFIG = load_config(ROOT)
DATABASE = CONFIG["database"]
TOKEN_DAYS = CONFIG["session"]["token_days"]

connection = connect_db(DATABASE)


def sign_up(name, password):
    if not make_account(connection, name, password):
        return None
    return make_token(connection, name, TOKEN_DAYS)


def sign_in(name, password):
    if not check_password(connection, name, password):
        return None
    return make_token(connection, name, TOKEN_DAYS)


def sign_out(token):
    drop_token(connection, token)


def owner_of(token):
    return read_token(connection, token)


def delete(name):
    return drop_account(connection, name)
