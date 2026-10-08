# True when a memory this close in meaning is already stored, so it is not written twice.
def same_memory(connection, owner, vector, closest):
    row = connection.execute(
        "SELECT 1 FROM memories WHERE owner = %s AND embedding <=> %s < %s LIMIT 1",
        (owner, str(vector), closest),
    ).fetchone()
    return row is not None
