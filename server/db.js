import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'running.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    avatar TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    distance REAL NOT NULL,
    duration_seconds INTEGER NOT NULL,
    pace_seconds INTEGER NOT NULL,
    heart_rate INTEGER,
    run_type TEXT DEFAULT 'road',
    photo_url TEXT,
    quote TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cheers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    type TEXT DEFAULT 'fire',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed default settings if not exists
const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
insertSetting.run('line_channel_access_token', '');
insertSetting.run('line_group_id', '');
insertSetting.run('team_monthly_goal_km', '250');
insertSetting.run('bot_name', '跑友圈打卡通知小幫手');

// Seed default user if empty
const userCount = db.prepare(`SELECT COUNT(*) as count FROM users`).get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`INSERT INTO users (name, avatar, bio) VALUES (?, ?, ?)`);
  insertUser.run('Kevin (我)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '目標本季半馬破百！今天不跑明天後悔');
}

export default db;
