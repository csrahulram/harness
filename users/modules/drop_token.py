# Removes one token, so signing out on one device leaves the others alone.
def drop_token(connection, token):
    connection.execute("DELETE FROM tokens WHERE token = %s", (token,))
