# Creates an account, or reports that the name is taken.
import secrets

import psycopg

from users.modules.hash_password import hash_password


def make_account(connection, name, password):
    salt = secrets.token_bytes(16)
    try:
        connection.execute(
            "INSERT INTO users (name, salt, hash) VALUES (%s, %s, %s)",
            (name, salt, hash_password(password, salt)),
        )
    except psycopg.errors.UniqueViolation:
        return False
    return True
