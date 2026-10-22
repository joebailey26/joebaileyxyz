PRAGMA foreign_keys = ON;

CREATE TABLE cms_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  active_revision TEXT,
  lease_token TEXT,
  lease_owner TEXT,
  lease_expires INTEGER NOT NULL DEFAULT 0
);
INSERT INTO cms_state (id) VALUES (1);

CREATE TABLE snapshots (
  id TEXT PRIMARY KEY,
  base_revision TEXT,
  lease_token TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('staging', 'complete')),
  created_at INTEGER NOT NULL,
  committed_at INTEGER,
  manifest TEXT NOT NULL,
  feed_hash TEXT,
  build_status TEXT NOT NULL DEFAULT 'none',
  build_error TEXT,
  build_attempts INTEGER NOT NULL DEFAULT 0,
  build_claim TEXT,
  build_claim_expires INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE snapshot_chunks (
  revision TEXT NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (revision, position)
);
CREATE TABLE snapshot_files (
  revision TEXT NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  checksum TEXT NOT NULL,
  size INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('media', 'private')),
  PRIMARY KEY (revision, path)
);
CREATE TABLE file_objects (
  checksum TEXT PRIMARY KEY,
  size INTEGER NOT NULL,
  media INTEGER NOT NULL DEFAULT 0,
  content_type TEXT NOT NULL
);
CREATE TABLE content_records (
  revision TEXT NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('blog', 'projects')),
  slug TEXT NOT NULL,
  date TEXT NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (revision, section, slug)
);
CREATE INDEX content_order ON content_records(revision, section, date DESC, slug);
CREATE INDEX snapshot_status ON snapshots(status, committed_at DESC);

-- A conditional failure here aborts the entire D1 batch, including pointer changes.
CREATE TABLE commit_assertion (ok INTEGER NOT NULL CHECK (ok = 1));
