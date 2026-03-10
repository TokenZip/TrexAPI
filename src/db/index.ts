import Database from 'better-sqlite3'
import type BetterSqlite3 from 'better-sqlite3'
import * as dotenv from 'dotenv'

dotenv.config()

const dbPath = process.env.SQLITE_PATH || 'trexapi_v1.db'
export const db: BetterSqlite3.Database = new Database(dbPath)

// Initialize the database schema
export const initDb = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS payloads (
        trex_id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        metadata TEXT NOT NULL,
        checksum_sha256 TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Optional: Table for API keys (simple auth via HMAC)
    db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        key_id TEXT PRIMARY KEY,
        secret TEXT NOT NULL,
        agent_id TEXT
      )
    `)
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}
