# Opens a database connection from the config plus the password held in the environment.
import os

import psycopg


def connect_db(settings):
    return psycopg.connect(
        host=settings["host"],
        port=settings["port"],
        dbname=settings["name"],
        user=settings["user"],
        password=os.environ["POSTGRES_PASSWORD"],
        autocommit=True,
    )
