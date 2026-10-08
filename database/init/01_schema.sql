-- Accounts, their sessions and their memories. Everything cascades from users.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  name     TEXT PRIMARY KEY,
  salt     BYTEA NOT NULL,
  hash     BYTEA NOT NULL,
  created  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tokens (
  token    TEXT PRIMARY KEY,
  owner    TEXT NOT NULL REFERENCES users(name) ON DELETE CASCADE,
  expires  TIMESTAMPTZ NOT NULL
);

CREATE TABLE sessions (
  session  TEXT PRIMARY KEY,
  owner    TEXT NOT NULL REFERENCES users(name) ON DELETE CASCADE,
  name     TEXT NOT NULL DEFAULT '',
  created  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed   TIMESTAMPTZ
);

CREATE INDEX sessions_by_owner ON sessions (owner, updated DESC);

CREATE TABLE memories (
  id        BIGSERIAL PRIMARY KEY,
  owner     TEXT NOT NULL REFERENCES users(name) ON DELETE CASCADE,
  session   TEXT,
  kind      TEXT NOT NULL,
  text      TEXT NOT NULL,
  source    TEXT,
  embedding vector(384),
  created   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX memories_by_owner ON memories (owner, kind);
CREATE INDEX memories_by_vector ON memories USING hnsw (embedding vector_cosine_ops);
