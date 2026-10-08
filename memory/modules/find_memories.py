# The memories closest in meaning to a piece of text, nearest first.
def find_memories(connection, owner, vector, limit, furthest):
    rows = connection.execute(
        "SELECT text, source, created, embedding <=> %s AS distance FROM memories"
        " WHERE owner = %s AND embedding <=> %s < %s"
        " ORDER BY distance LIMIT %s",
        (str(vector), owner, str(vector), furthest, limit),
    ).fetchall()
    return [
        {"text": row[0], "source": row[1], "created": row[2].isoformat(), "distance": round(row[3], 3)}
        for row in rows
    ]
