-- ==============================================================================
-- RunSync 跑友圈 - PostgreSQL Schema 定義檔
-- 伺服器啟動時會自動執行 (全部為 IF NOT EXISTS，可重複執行)
-- ==============================================================================

-- 1. 成員資料表 (LINE 身分 + 審核狀態 + 權限 + 個人基本資料)
--    首次以 LINE 登入者自動建立為 pending，經管理員核准後改為 active 才能使用
CREATE TABLE IF NOT EXISTS members (
  id          SERIAL PRIMARY KEY,
  line_id     VARCHAR(64) NOT NULL UNIQUE,              -- LINE userId (U 開頭 33 碼)，由 LINE 登入自動取得
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'active')),
  position    VARCHAR(20) NOT NULL DEFAULT 'member'
              CHECK (position IN ('admin', 'member')),  -- admin 可在前端審核 / 管理成員
  name        VARCHAR(50) NOT NULL,
  avatar      TEXT,                                     -- 大頭照：LINE 頭像網址或上傳路徑 /uploads/avatars/...
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 舊版資料表升級：補上 status 欄位 (既有成員視為已核准)
ALTER TABLE members ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
  CHECK (status IN ('pending', 'active'));
ALTER TABLE members ALTER COLUMN status SET DEFAULT 'pending';

-- 2. 跑步成績表
CREATE TABLE IF NOT EXISTS runs (
  id               SERIAL PRIMARY KEY,
  member_id        INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  distance         NUMERIC(6, 2) NOT NULL CHECK (distance > 0),
  duration_seconds INTEGER NOT NULL,
  pace_seconds     INTEGER NOT NULL,
  heart_rate       INTEGER,
  run_type         VARCHAR(20) DEFAULT 'road',
  photo_url        TEXT,
  quote            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 跑友加油互動表
CREATE TABLE IF NOT EXISTS cheers (
  id         SERIAL PRIMARY KEY,
  run_id     INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  user_name  VARCHAR(50) NOT NULL,
  type       VARCHAR(20) DEFAULT 'fire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 系統設定表 (儲存 LINE Token、推播群組 ID 等)
CREATE TABLE IF NOT EXISTS settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT
);

INSERT INTO settings (key, value) VALUES
  ('line_channel_access_token', ''),
  ('line_group_id', ''),
  ('team_monthly_goal_km', '250'),
  ('bot_name', '跑友圈打卡通知小幫手')
ON CONFLICT (key) DO NOTHING;

-- 5. 賽事表 (管理員設定目標賽事，首頁顯示倒數計時)
CREATE TABLE IF NOT EXISTS races (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,                    -- 賽事名稱，例如「臺北馬拉松」
  start_at    TIMESTAMPTZ NOT NULL,                     -- 賽事日期 + 鳴槍時間
  created_by  INTEGER REFERENCES members(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引 (加速個人成績查詢與時間範圍聚合)
CREATE INDEX IF NOT EXISTS idx_runs_member_created ON runs(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_created ON runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cheers_run ON cheers(run_id);
CREATE INDEX IF NOT EXISTS idx_races_start ON races(start_at);
