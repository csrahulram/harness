# Stores one memory for a person, with the sentence it came from.
def add_memory(connection, owner, session, kind, text, source, vector):
    connection.execute(
        "INSERT INTO memories (owner, session, kind, text, source, embedding)"
        " VALUES (%s, %s, %s, %s, %s, %s)",
        (owner, session, kind, text, source, str(vector)),
    )
