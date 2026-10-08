# Names a session after its first message, leaving a name the person chose alone.
def name_once(connection, session, name):
    connection.execute(
        "UPDATE sessions SET name = %s WHERE session = %s AND name = ''", (name, session)
    )
