CREATE TABLE IF NOT EXISTS payloads (
  trex_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  metadata TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_id TEXT PRIMARY KEY,
  secret TEXT NOT NULL,
  agent_id TEXT
);
