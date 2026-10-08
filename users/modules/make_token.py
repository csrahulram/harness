# Issues a token for an account and records when it stops working.
import secrets
from datetime import timedelta


def make_token(connection, name, days):
    token = secrets.token_urlsafe(32)
    connection.execute(
        "INSERT INTO tokens (token, owner, expires) VALUES (%s, %s, now() + %s)",
        (token, name, timedelta(days=days)),
    )
    return token
