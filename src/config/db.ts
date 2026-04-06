import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve('finlytics.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    UNIQUE NOT NULL,
    password_hash TEXT  NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'viewer'
                CHECK(role IN ('viewer', 'analyst', 'admin')),
    status      TEXT    NOT NULL DEFAULT 'active'
                CHECK(status IN ('active', 'inactive')),
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS financial_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by  INTEGER NOT NULL REFERENCES users(id),
    amount      REAL    NOT NULL CHECK(amount > 0),
    type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
    category    TEXT    NOT NULL,
    date        TEXT    NOT NULL,
    notes       TEXT,
    deleted_at  TEXT    DEFAULT NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );
`);

export default db;