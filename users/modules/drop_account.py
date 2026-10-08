# Removes an account; tokens, sessions and memories go with it by cascade.
def drop_account(connection, name):
    result = connection.execute("DELETE FROM users WHERE name = %s", (name,))
    return result.rowcount > 0
