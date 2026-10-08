# Everything the harness remembers about a person, newest first, for them to read.
def list_memories(connection, owner, limit):
    rows = connection.execute(
        "SELECT id, kind, text, source, session, created FROM memories"
        " WHERE owner = %s ORDER BY created DESC LIMIT %s",
        (owner, limit),
    ).fetchall()
    return [
        {"id": r[0], "kind": r[1], "text": r[2], "source": r[3], "session": r[4], "created": r[5].isoformat()}
        for r in rows
    ]
