# Marks a session closed by its owner, which is what hides it from the list.
def close_session(connection, session):
    connection.execute("UPDATE sessions SET closed = now() WHERE session = %s", (session,))
