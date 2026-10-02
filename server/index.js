import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, queryOne, initDatabase } from './db.js';
import { requireMember, requireAdmin, AUTH_MODE } from './auth.js';
import { buildFlexMessage, buildTextMessage, sendLinePushMessage, sendLineMulticast } from './lineService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const DIST_DIR = path.join(__dirname, '..', 'dist');
// 舊版大頭照存放位置，啟動時會搬進資料庫 (見 migrateLegacyAvatarFiles)
const LEGACY_AVATAR_DIR = path.join(__dirname, 'uploads', 'avatars');

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allows base64 image upload
// Built frontend (npm run build); lets one ngrok tunnel serve both page and API
app.use(express.static(DIST_DIR));

// Helper to get setting value
async function getSetting(key, defaultValue = '') {
  const row = await queryOne('SELECT value FROM settings WHERE key = $1', [key]);
  return row ? row.value : defaultValue;
}

// Helper to set setting value
async function setSetting(key, value) {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

// Channel access token: settings page value takes precedence over .env
async function getLineToken() {
  return (await getSetting('line_channel_access_token')) || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
}

// LINE requires absolute https image URLs; uploaded avatars are stored as relative paths (/avatars/...)
function toAbsoluteUrl(url, req) {
  if (!url || /^https?:\/\//.test(url)) return url;
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}${url}`;
}

// Link used in LINE messages: open the LIFF app inside LINE when configured
function appLinkUrl(req) {
  if (process.env.LINE_LIFF_ID) return `https://liff.line.me/${process.env.LINE_LIFF_ID}`;
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

// Period filter on runs alias `r` (session timezone = APP_TIMEZONE, so ::date is the local day)
function periodCondition(period) {
  if (period === 'today') return 'r.created_at::date = CURRENT_DATE';
  if (period === 'week') return "r.created_at::date >= CURRENT_DATE - INTERVAL '6 days'";
  if (period === 'month') return "date_trunc('month', r.created_at) = date_trunc('month', now())";
  return 'TRUE';
}

const MEMBER_PUBLIC_COLUMNS = 'id, name, avatar, position, created_at';

// Public (no login): uploaded avatar images, also fetched by LINE for the report cards.
// The URL carries ?v=<timestamp> that changes on every upload, so it can be cached forever.
app.get('/avatars/:memberId', async (req, res) => {
  const avatar = await queryOne(
    'SELECT mime, data FROM member_avatars WHERE member_id = $1',
    [parseInt(req.params.memberId, 10) || 0]
  );
  if (!avatar) return res.status(404).end();
  res.set('Content-Type', avatar.mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(avatar.data);
});

// Run report photos are only kept for a short time (not long-term storage)
const RUN_PHOTO_TTL = '7 days';
const RUN_PHOTO_MAX_BYTES = 3 * 1024 * 1024;

// Delete expired run photos and clear the runs' photo_url that pointed at them
async function purgeExpiredRunPhotos() {
  const { rows } = await query(
    `DELETE FROM run_photos WHERE created_at < now() - $1::interval RETURNING run_id`,
    [RUN_PHOTO_TTL]
  );
  if (rows.length > 0) {
    await query(`UPDATE runs SET photo_url = NULL WHERE id = ANY($1)`, [rows.map((r) => r.run_id)]);
  }
}

// Public (no login): run report photo, fetched by LINE for the report card's hero image
app.get('/run-photos/:runId', async (req, res) => {
  const photo = await queryOne(
    `SELECT mime, data FROM run_photos WHERE run_id = $1 AND created_at >= now() - $2::interval`,
    [parseInt(req.params.runId, 10) || 0, RUN_PHOTO_TTL]
  );
  if (!photo) return res.status(404).end();
  res.set('Content-Type', photo.mime);
  res.set('Cache-Control', 'public, max-age=604800');
  res.send(photo.data);
});

// Public: frontend needs to know how to log in before calling other APIs
app.get('/api/config', (req, res) => {
  res.json({ authMode: AUTH_MODE, liffId: process.env.LINE_LIFF_ID || null });
});

// All API routes below require an approved (active) member
app.use('/api', requireMember);

// ==========================================
// ME (目前登入者 / 個人基本資料)
// ==========================================

app.get('/api/me', (req, res) => {
  const { id, line_id, name, avatar, position, created_at } = req.member;
  res.json({ id, line_id, name, avatar, position, created_at });
});

app.put('/api/me', async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: '姓名為必填欄位' });
  }
  if (name.length > 50) {
    return res.status(400).json({ error: '姓名最多 50 個字' });
  }
  const updated = await queryOne(
    `UPDATE members SET name = $1, updated_at = now() WHERE id = $2
     RETURNING id, line_id, name, avatar, position, created_at`,
    [name, req.member.id]
  );
  res.json(updated);
});

const AVATAR_MIME_BY_EXT = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const IMAGE_MIME_TYPES = new Set(Object.values(AVATAR_MIME_BY_EXT));
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

// Store image bytes in member_avatars and point members.avatar at the public /avatars URL
async function saveAvatar(memberId, mime, data) {
  await query(
    `INSERT INTO member_avatars (member_id, mime, data, updated_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (member_id) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data, updated_at = now()`,
    [memberId, mime, data]
  );
  return queryOne(
    `UPDATE members SET avatar = $1, updated_at = now() WHERE id = $2
     RETURNING id, line_id, name, avatar, position, created_at`,
    [`/avatars/${memberId}?v=${Date.now()}`, memberId]
  );
}

// Body: { image: "data:image/jpeg;base64,..." }
app.post('/api/me/avatar', async (req, res) => {
  const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(req.body.image || '');
  if (!match || !IMAGE_MIME_TYPES.has(match[1])) {
    return res.status(400).json({ error: '僅支援 JPG / PNG / WebP 圖片' });
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > AVATAR_MAX_BYTES) {
    return res.status(400).json({ error: '圖片大小不可超過 2MB' });
  }

  res.json(await saveAvatar(req.member.id, match[1], buffer));
});

// ==========================================
// MEMBERS API
// ==========================================

// All approved members (ranked by total distance); line_id only visible to admins
app.get('/api/members', async (req, res) => {
  const isAdmin = req.member.position === 'admin';
  const { rows } = await query(`
    SELECT ${MEMBER_PUBLIC_COLUMNS.split(', ').map(c => `m.${c}`).join(', ')}
      ${isAdmin ? ', m.line_id' : ''},
      COUNT(r.id) AS total_runs,
      COALESCE(SUM(r.distance), 0) AS total_distance
    FROM members m
    LEFT JOIN runs r ON m.id = r.member_id
    WHERE m.status = 'active'
    GROUP BY m.id
    ORDER BY total_distance DESC, m.id ASC
  `);
  res.json(rows);
});

// Admin: join requests waiting for approval
app.get('/api/members/pending', requireAdmin, async (req, res) => {
  const { rows } = await query(
    `SELECT ${MEMBER_PUBLIC_COLUMNS}, line_id FROM members WHERE status = 'pending' ORDER BY created_at ASC`
  );
  res.json(rows);
});

// Admin: approve a join request
app.post('/api/members/:id/approve', requireAdmin, async (req, res) => {
  const approved = await queryOne(
    `UPDATE members SET status = 'active', updated_at = now()
     WHERE id = $1 AND status = 'pending'
     RETURNING ${MEMBER_PUBLIC_COLUMNS}, line_id`,
    [parseInt(req.params.id, 10)]
  );
  if (!approved) {
    return res.status(404).json({ error: '找不到該筆待審核申請' });
  }
  res.json(approved);
});

// Admin: remove a member or reject a join request (their runs are deleted by cascade)
app.delete('/api/members/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.member.id) {
    return res.status(400).json({ error: '無法刪除自己的帳號' });
  }
  // member_avatars row is removed by ON DELETE CASCADE
  const deleted = await queryOne('DELETE FROM members WHERE id = $1 RETURNING id', [id]);
  if (!deleted) {
    return res.status(404).json({ error: '找不到該成員' });
  }
  res.json({ success: true });
});

// ==========================================
// RUNS API
// ==========================================

// Get runs with optional member_id and period filters (everyone can view everyone's runs)
app.get('/api/runs', async (req, res) => {
  const { member_id, period } = req.query;
  const conditions = [periodCondition(period)];
  const params = [];

  if (member_id) {
    params.push(parseInt(member_id, 10));
    conditions.push(`r.member_id = $${params.length}`);
  }

  const { rows } = await query(`
    SELECT
      r.*,
      m.name AS user_name,
      m.avatar AS user_avatar,
      (SELECT COUNT(*) FROM cheers c WHERE c.run_id = r.id AND c.type = 'fire') AS fire_count,
      (SELECT COUNT(*) FROM cheers c WHERE c.run_id = r.id AND c.type = 'like') AS like_count,
      (SELECT COUNT(*) FROM cheers c WHERE c.run_id = r.id AND c.type = 'nudge') AS nudge_count
    FROM runs r
    JOIN members m ON r.member_id = m.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY r.created_at DESC
    LIMIT 100
  `, params);

  res.json(rows);
});

// Create a run for the logged-in member and optionally push the report to the other members' LINE
app.post('/api/runs', async (req, res) => {
  const {
    distance,
    duration_seconds,
    pace_seconds: inputPace,
    heart_rate,
    run_type = 'road',
    photo, // optional data URL: "data:image/jpeg;base64,..."
    quote,
    notify_line = true
  } = req.body;

  const dist = parseFloat(distance);
  if (!dist || dist <= 0) {
    return res.status(400).json({ error: '請提供有效的跑步里程' });
  }

  let duration = parseInt(duration_seconds) || 0;
  let pace = parseInt(inputPace) || 0;
  if (!pace && duration > 0) {
    pace = Math.round(duration / dist);
  } else if (pace > 0 && duration === 0) {
    duration = Math.round(pace * dist);
  }

  let photoMatch = null;
  if (photo) {
    photoMatch = /^data:(image\/[a-z]+);base64,(.+)$/.exec(photo);
    if (!photoMatch || !IMAGE_MIME_TYPES.has(photoMatch[1])) {
      return res.status(400).json({ error: '戰報配圖僅支援 JPG / PNG / WebP 圖片' });
    }
  }
  const photoBuffer = photoMatch && Buffer.from(photoMatch[2], 'base64');
  if (photoBuffer && photoBuffer.length > RUN_PHOTO_MAX_BYTES) {
    return res.status(400).json({ error: '戰報配圖大小不可超過 3MB' });
  }

  // 成績一律記在登入者本人名下，不採用前端傳來的 member_id
  const runner = req.member;
  let createdRun = await queryOne(
    `INSERT INTO runs (member_id, distance, duration_seconds, pace_seconds, heart_rate, run_type, quote)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *, $8::text AS user_name, $9::text AS user_avatar`,
    [
      runner.id,
      dist,
      duration,
      pace,
      heart_rate ? parseInt(heart_rate) : null,
      run_type,
      quote ? quote.trim() : null,
      runner.name,
      runner.avatar
    ]
  );

  if (photoBuffer) {
    await query(
      'INSERT INTO run_photos (run_id, mime, data) VALUES ($1, $2, $3)',
      [createdRun.id, photoMatch[1], photoBuffer]
    );
    const photoUrl = `/run-photos/${createdRun.id}`;
    await query('UPDATE runs SET photo_url = $1 WHERE id = $2', [photoUrl, createdRun.id]);
    createdRun = { ...createdRun, photo_url: photoUrl };
  }
  purgeExpiredRunPhotos().catch((err) => console.error('清除過期戰報配圖失敗:', err));

  const clientUrl = appLinkUrl(req);
  const lineRunner = { ...runner, avatar: toAbsoluteUrl(runner.avatar, req) };
  const lineRun = { ...createdRun, photo_url: toAbsoluteUrl(createdRun.photo_url, req) };
  const flexMessage = buildFlexMessage(lineRun, lineRunner, clientUrl);
  const textFallback = buildTextMessage(lineRun, lineRunner, clientUrl);

  // 推播給其他已核准跑友 (不含打卡者本人)；在背景送出，不拖慢打卡回應
  let linePushResult = null;
  if (notify_line) {
    const recipients = await query(
      `SELECT line_id FROM members WHERE status = 'active' AND id <> $1`,
      [runner.id]
    );
    linePushResult = { queued: true, recipients: recipients.length };
    getLineToken()
      .then((token) => sendLineMulticast({
        token,
        to: recipients.map((m) => m.line_id),
        flexMessage,
        textFallback
      }))
      .then((result) => {
        if (!result.success) console.error(`LINE 推播失敗 (run #${createdRun.id}):`, JSON.stringify(result));
      })
      .catch((err) => console.error(`LINE 推播失敗 (run #${createdRun.id}):`, err));
  }

  res.status(201).json({
    run: { ...createdRun, fire_count: 0, like_count: 0, nudge_count: 0 },
    linePush: linePushResult,
    flexMessage,
    textFallback
  });
});

// Cheer / Nudge a run
app.post('/api/runs/:id/cheer', async (req, res) => {
  const runId = parseInt(req.params.id, 10);
  const validTypes = ['fire', 'like', 'nudge'];
  const cheerType = validTypes.includes(req.body.type) ? req.body.type : 'fire';

  await query('INSERT INTO cheers (run_id, user_name, type) VALUES ($1, $2, $3)', [runId, req.member.name, cheerType]);

  const counts = await queryOne(`
    SELECT
      COUNT(*) FILTER (WHERE type = 'fire') AS fire_count,
      COUNT(*) FILTER (WHERE type = 'like') AS like_count,
      COUNT(*) FILTER (WHERE type = 'nudge') AS nudge_count
    FROM cheers WHERE run_id = $1
  `, [runId]);

  res.json({ success: true, counts });
});

// ==========================================
// STATS & LEADERBOARD API
// ==========================================

app.get('/api/stats', async (req, res) => {
  const period = req.query.period || 'week'; // 'today' | 'week' | 'month' | 'all'
  const dateFilter = periodCondition(period);

  const { rows: leaderboard } = await query(`
    SELECT
      m.id AS user_id,
      m.name,
      m.avatar,
      COALESCE(SUM(r.distance), 0) AS total_distance,
      COUNT(r.id) AS run_count,
      COALESCE(SUM(r.duration_seconds), 0) AS total_duration,
      MIN(CASE WHEN r.distance >= 3 THEN r.pace_seconds END) AS best_pace_seconds,
      ROUND(AVG(r.pace_seconds)) AS avg_pace_seconds
    FROM members m
    LEFT JOIN runs r ON m.id = r.member_id AND ${dateFilter}
    WHERE m.status = 'active'
    GROUP BY m.id
    ORDER BY total_distance DESC, total_duration ASC
  `);

  const teamAgg = await queryOne(`
    SELECT
      COALESCE(SUM(distance), 0) AS total_team_distance,
      COUNT(id) AS total_team_runs,
      COALESCE(SUM(duration_seconds), 0) AS total_team_duration,
      ROUND(AVG(pace_seconds)) AS avg_team_pace
    FROM runs r
    WHERE ${dateFilter}
  `);

  const monthlyGoalKm = parseFloat(await getSetting('team_monthly_goal_km', '250'));
  const { total: monthCurrent } = await queryOne(`
    SELECT COALESCE(SUM(distance), 0) AS total FROM runs r WHERE ${periodCondition('month')}
  `);

  // Recent 7 days chart data
  const { rows: chartDays } = await query(`
    SELECT
      to_char(d.date, 'YYYY-MM-DD') AS date,
      to_char(d.date, 'MM/DD') AS display_date,
      COALESCE(SUM(r.distance), 0) AS total_distance
    FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, INTERVAL '1 day') AS d(date)
    LEFT JOIN runs r ON r.created_at::date = d.date::date
    GROUP BY d.date
    ORDER BY d.date ASC
  `);

  res.json({
    period,
    leaderboard,
    teamStats: {
      ...teamAgg,
      monthlyGoalKm,
      monthCurrentDistance: monthCurrent,
      monthGoalProgress: Math.min(100, Math.round((monthCurrent / monthlyGoalKm) * 100))
    },
    dailyChart: chartDays
  });
});

// ==========================================
// RACES API (目標賽事倒數)
// ==========================================

// start_local: 以 APP_TIMEZONE 表示的 "YYYY-MM-DDTHH:MM"，給前端表單直接使用；
// upcoming: 賽事當天結束前都算 (首頁倒數顯示用)
const RACE_COLUMNS = `
  id, name, start_at,
  to_char(start_at, 'YYYY-MM-DD"T"HH24:MI') AS start_local,
  start_at::date >= CURRENT_DATE AS upcoming,
  created_at, updated_at`;

// Body: { name, start_local: "2026-12-20T06:30" } (interpreted in the session timezone)
function parseRaceBody(body) {
  const name = (body.name || '').trim();
  const startLocal = body.start_local || '';
  if (!name) return { error: '賽事名稱為必填欄位' };
  if (name.length > 100) return { error: '賽事名稱最多 100 個字' };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startLocal) || Number.isNaN(Date.parse(startLocal))) {
    return { error: '請提供有效的賽事日期' };
  }
  return { name, startLocal };
}

app.get('/api/races', async (req, res) => {
  const { rows } = await query(`SELECT ${RACE_COLUMNS} FROM races ORDER BY start_at ASC, id ASC`);
  res.json(rows);
});

app.post('/api/races', requireAdmin, async (req, res) => {
  const { name, startLocal, error } = parseRaceBody(req.body);
  if (error) return res.status(400).json({ error });
  const created = await queryOne(
    `INSERT INTO races (name, start_at, created_by) VALUES ($1, $2::timestamp, $3)
     RETURNING ${RACE_COLUMNS}`,
    [name, startLocal, req.member.id]
  );
  res.status(201).json(created);
});

app.put('/api/races/:id', requireAdmin, async (req, res) => {
  const { name, startLocal, error } = parseRaceBody(req.body);
  if (error) return res.status(400).json({ error });
  const updated = await queryOne(
    `UPDATE races SET name = $1, start_at = $2::timestamp, updated_at = now() WHERE id = $3
     RETURNING ${RACE_COLUMNS}`,
    [name, startLocal, parseInt(req.params.id, 10)]
  );
  if (!updated) return res.status(404).json({ error: '找不到該賽事' });
  res.json(updated);
});

app.delete('/api/races/:id', requireAdmin, async (req, res) => {
  const deleted = await queryOne('DELETE FROM races WHERE id = $1 RETURNING id', [parseInt(req.params.id, 10)]);
  if (!deleted) return res.status(404).json({ error: '找不到該賽事' });
  res.json({ success: true });
});

// ==========================================
// SETTINGS & LINE TESTING API
// ==========================================

app.get('/api/settings', async (req, res) => {
  const lineToken = await getLineToken();
  res.json({
    hasToken: Boolean(lineToken && lineToken.length > 20),
    line_channel_access_token: lineToken ? `${lineToken.substring(0, 10)}...${lineToken.slice(-6)}` : '',
    team_monthly_goal_km: await getSetting('team_monthly_goal_km', '250'),
    bot_name: await getSetting('bot_name', '跑友圈打卡小幫手')
  });
});

app.post('/api/settings', requireAdmin, async (req, res) => {
  const { line_channel_access_token, team_monthly_goal_km, bot_name } = req.body;

  if (line_channel_access_token !== undefined && !line_channel_access_token.includes('...')) {
    await setSetting('line_channel_access_token', line_channel_access_token.trim());
  }
  if (team_monthly_goal_km !== undefined) {
    await setSetting('team_monthly_goal_km', String(parseFloat(team_monthly_goal_km) || 250));
  }
  if (bot_name !== undefined) {
    await setSetting('bot_name', bot_name.trim());
  }

  res.json({ success: true, message: '設定已成功儲存' });
});

// Test LINE push: sends a sample report to the admin's own LINE chat with the official account
app.post('/api/settings/test-line', requireAdmin, async (req, res) => {
  const { line_channel_access_token } = req.body;
  const token = line_channel_access_token && !line_channel_access_token.includes('...')
    ? line_channel_access_token.trim()
    : await getLineToken();

  if (!token) {
    return res.status(400).json({
      success: false,
      error: '請提供 LINE Channel Access Token'
    });
  }

  const dummyRun = {
    distance: 5.2,
    duration_seconds: 1620,
    pace_seconds: 311,
    heart_rate: 156,
    run_type: 'road',
    quote: '這是一則連線測試訊息！跑友圈戰報小幫手已成功就緒，準備監督大家開跑！🏃‍♂️🔥'
  };
  const dummyRunner = {
    name: '測試跑者',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  };

  const clientUrl = appLinkUrl(req);
  const result = await sendLinePushMessage({
    token,
    to: req.member.line_id,
    flexMessage: buildFlexMessage(dummyRun, dummyRunner, clientUrl),
    textFallback: buildTextMessage(dummyRun, dummyRunner, clientUrl)
  });

  res.json(result);
});

// SPA fallback: non-API routes return the built index.html
app.get(/^(?!\/api\/|\/avatars\/|\/run-photos\/).*/, (req, res, next) => {
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtml)) return next();
  res.sendFile(indexHtml);
});

// Error handler (Express 5 forwards rejected async handlers here)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || '伺服器錯誤' });
});

// One-time upgrade: move avatars saved by older versions as files (server/uploads/avatars) into the database
async function migrateLegacyAvatarFiles() {
  const { rows } = await query(`SELECT id, avatar FROM members WHERE avatar LIKE '/uploads/avatars/%'`);
  for (const member of rows) {
    const filename = path.basename(member.avatar);
    const mime = AVATAR_MIME_BY_EXT[path.extname(filename).slice(1).toLowerCase()];
    const data = await fs.promises.readFile(path.join(LEGACY_AVATAR_DIR, filename)).catch(() => null);
    if (mime && data) {
      await saveAvatar(member.id, mime, data);
      console.log(`📦 已將成員 #${member.id} 的大頭照搬進資料庫`);
    } else {
      // File is gone: fall back to the default avatar instead of a broken image
      await query('UPDATE members SET avatar = NULL WHERE id = $1', [member.id]);
      console.warn(`⚠️ 找不到成員 #${member.id} 的大頭照檔案 ${filename}，已改回預設頭像`);
    }
  }
}

initDatabase()
  .then(migrateLegacyAvatarFiles)
  .then(purgeExpiredRunPhotos)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🏃 RunSync Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ 資料庫初始化失敗:', err.message);
    process.exit(1);
  });
