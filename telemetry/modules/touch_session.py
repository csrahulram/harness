# Records that a session exists for its owner and that it was just used.
def touch_session(connection, session, owner):
    connection.execute(
        "INSERT INTO sessions (session, owner) VALUES (%s, %s)"
        " ON CONFLICT (session) DO UPDATE SET updated = now()",
        (session, owner),
    )
