# Forgets one memory, provided it belongs to the person asking.
def drop_memory(connection, owner, memory_id):
    result = connection.execute(
        "DELETE FROM memories WHERE id = %s AND owner = %s", (memory_id, owner)
    )
    return result.rowcount > 0
