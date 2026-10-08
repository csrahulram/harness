# The account a token belongs to, or None when it is unknown or has expired.
def read_token(connection, token):
    if not isinstance(token, str) or not token:
        return None
    row = connection.execute(
        "SELECT owner FROM tokens WHERE token = %s AND expires > now()", (token,)
    ).fetchone()
    return row[0] if row else None
