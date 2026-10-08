# Turns a password and salt into the stored hash, slowly enough to make guessing expensive.
import hashlib


def hash_password(password, salt):
    return hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1, dklen=32)
