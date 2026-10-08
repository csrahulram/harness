-- The knowledge base: markdown notes chunked by heading, with their links and tags.
-- owner is NULL for notes everyone shares, or a name for a private vault.
CREATE TABLE knowledge (
  id        BIGSERIAL PRIMARY KEY,
  owner     TEXT REFERENCES users(name) ON DELETE CASCADE,
  path      TEXT NOT NULL,
  heading   TEXT NOT NULL DEFAULT '',
  text      TEXT NOT NULL,
  links     TEXT[] NOT NULL DEFAULT '{}',
  tags      TEXT[] NOT NULL DEFAULT '{}',
  changed   TIMESTAMPTZ NOT NULL,
  embedding vector(384),
  created   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX knowledge_by_path ON knowledge (path);
CREATE INDEX knowledge_by_owner ON knowledge (owner);
CREATE INDEX knowledge_by_vector ON knowledge USING hnsw (embedding vector_cosine_ops);
