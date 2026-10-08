# True when the password matches the stored hash for that account.
import hmac

from users.modules.hash_password import hash_password


def check_password(connection, name, password):
    row = connection.execute("SELECT salt, hash FROM users WHERE name = %s", (name,)).fetchone()
    if row is None:
        return False
    salt, stored = row
    return hmac.compare_digest(bytes(stored), hash_password(password, bytes(salt)))
