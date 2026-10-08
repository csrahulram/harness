# The person a session belongs to, or None when there is no such session.
def owner_of(connection, session):
    row = connection.execute("SELECT owner FROM sessions WHERE session = %s", (session,)).fetchone()
    return row[0] if row else None
