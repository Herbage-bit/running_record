-- ==============================================================================
-- RunSync 跑友圈 - PostgreSQL Schema 定義檔
-- ==============================================================================

-- 1. 跑者資料表 (使用者與 LINE 身分關聯)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  line_user_id VARCHAR(64) UNIQUE,
  line_display_name VARCHAR(100),
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. 跑步紀錄表
CREATE TABLE IF NOT EXISTS runs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  distance NUMERIC(6, 2) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  pace_seconds INTEGER NOT NULL,
  heart_rate INTEGER,
  run_type VARCHAR(20) DEFAULT 'road',
  photo_url TEXT,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. 跑友加油互動表
CREATE TABLE IF NOT EXISTS cheers (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  user_name VARCHAR(50) NOT NULL,
  type VARCHAR(20) DEFAULT 'fire',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. 系統設定表 (儲存 LINE Token、推播群組 ID 等)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
);

-- 5. 初始設定種子資料 (若鍵值存在則忽略)
INSERT INTO settings (key, value) VALUES
  ('line_channel_access_token', ''),
  ('line_group_id', ''),
  ('team_monthly_goal_km', '250'),
  ('bot_name', '跑友圈打卡通知小幫手')
ON CONFLICT (key) DO NOTHING;

-- 索引優化 (加速跑者查詢與時間範圍聚合計算法)
CREATE INDEX IF NOT EXISTS idx_runs_user_created ON runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id);
