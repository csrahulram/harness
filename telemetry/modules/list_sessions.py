# The open sessions belonging to one person, most recently used first.
def list_sessions(connection, owner):
    rows = connection.execute(
        "SELECT session, name, created, updated FROM sessions"
        " WHERE owner = %s AND closed IS NULL ORDER BY updated DESC",
        (owner,),
    ).fetchall()
    return [
        {"session": row[0], "name": row[1], "created": row[2].isoformat(), "updated": row[3].isoformat()}
        for row in rows
    ]
