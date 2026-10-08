# Sets a session's name, whatever it was called before.
def name_session(connection, session, name):
    connection.execute(
        "UPDATE sessions SET name = %s, updated = now() WHERE session = %s", (name, session)
    )
