import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { buildFlexMessage, buildTextMessage, sendLinePushMessage, formatPace, formatDuration } from './lineService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allows base64 image upload if user takes photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper to get setting value
function getSetting(key, defaultValue = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : defaultValue;
}

// Helper to set setting value
function setSetting(key, value) {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
}

// ==========================================
// USERS API
// ==========================================

// Get all users
app.get('/api/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.*, 
      COALESCE(COUNT(r.id), 0) as total_runs,
      COALESCE(SUM(r.distance), 0) as total_distance
    FROM users u
    LEFT JOIN runs r ON u.id = r.user_id
    GROUP BY u.id
    ORDER BY total_distance DESC
  `).all();
  res.json(users);
});

// Add a new user
app.post('/api/users', (req, res) => {
  const { name, avatar, bio } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '姓名為必填欄位' });
  }

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
  try {
    const info = db.prepare(`
      INSERT INTO users (name, avatar, bio) VALUES (?, ?, ?)
    `).run(name.trim(), avatar || defaultAvatar, bio || '熱血開跑中！');
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: '跑者暱稱已存在，請使用不同名稱' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// RUNS API
// ==========================================

// Get runs with optional user_id and period filters
app.get('/api/runs', (req, res) => {
  const { user_id, period } = req.query;
  const conditions = [];
  const params = [];

  if (user_id) {
    conditions.push('r.user_id = ?');
    params.push(user_id);
  }

  if (period === 'today') {
    conditions.push("DATE(r.created_at, 'localtime') = DATE('now', 'localtime')");
  } else if (period === 'week') {
    conditions.push("DATE(r.created_at, 'localtime') >= DATE('now', 'localtime', '-6 days')");
  } else if (period === 'month') {
    conditions.push("strftime('%Y-%m', r.created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const runs = db.prepare(`
    SELECT 
      r.*,
      u.name as user_name,
      u.avatar as user_avatar,
      (SELECT COUNT(*) FROM cheers c WHERE c.run_id = r.id AND c.type = 'fire') as fire_count,
      (SELECT COUNT(*) FROM cheers c WHERE c.run_id = r.id AND c.type = 'like') as like_count,
      (SELECT COUNT(*) FROM cheers c WHERE c.run_id = r.id AND c.type = 'nudge') as nudge_count
    FROM runs r
    JOIN users u ON r.user_id = u.id
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT 100
  `).all(...params);

  res.json(runs);
});

// Create a new run record and optionally push to LINE
app.post('/api/runs', async (req, res) => {
  try {
    const {
      user_id,
      distance,
      duration_seconds,
      pace_seconds: inputPace,
      heart_rate,
      run_type = 'road',
      photo_url,
      quote,
      notify_line = true
    } = req.body;

    const dist = parseFloat(distance);
    if (!user_id || !dist || dist <= 0) {
      return res.status(400).json({ error: '請提供有效的跑者與跑步里程' });
    }

    const duration = parseInt(duration_seconds) || 0;
    // Calculate pace if not provided or derive
    let pace = parseInt(inputPace) || 0;
    if (!pace && duration > 0 && dist > 0) {
      pace = Math.round(duration / dist);
    } else if (pace > 0 && duration === 0) {
      // If pace is given but duration not, calculate duration
      duration = Math.round(pace * dist);
    }

    const runner = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    if (!runner) {
      return res.status(404).json({ error: '找不到該跑者' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO runs (user_id, distance, duration_seconds, pace_seconds, heart_rate, run_type, photo_url, quote, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(
      user_id,
      dist,
      duration,
      pace,
      heart_rate ? parseInt(heart_rate) : null,
      run_type,
      photo_url || null,
      quote ? quote.trim() : null
    );

    const createdRun = db.prepare(`
      SELECT 
        r.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM runs r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    // Build LINE messages
    const hostHeader = req.get('host');
    const protocol = req.protocol;
    const clientUrl = `${protocol}://${hostHeader}`;
    const flexMessage = buildFlexMessage(createdRun, runner, clientUrl);
    const textFallback = buildTextMessage(createdRun, runner, clientUrl);

    let linePushResult = null;
    if (notify_line) {
      const lineToken = getSetting('line_channel_access_token');
      const lineTarget = getSetting('line_group_id');
      linePushResult = await sendLinePushMessage({
        token: lineToken,
        to: lineTarget,
        flexMessage,
        textFallback
      });
    }

    res.status(201).json({
      run: {
        ...createdRun,
        fire_count: 0,
        like_count: 0,
        nudge_count: 0
      },
      linePush: linePushResult,
      flexMessage,
      textFallback
    });
  } catch (err) {
    console.error('Error creating run:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cheer / Nudge a run
app.post('/api/runs/:id/cheer', (req, res) => {
  const runId = req.params.id;
  const { user_name = '匿名跑友', type = 'fire' } = req.body;

  const validTypes = ['fire', 'like', 'nudge'];
  const cheerType = validTypes.includes(type) ? type : 'fire';

  db.prepare(`
    INSERT INTO cheers (run_id, user_name, type) VALUES (?, ?, ?)
  `).run(runId, user_name, cheerType);

  const counts = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM cheers WHERE run_id = ? AND type = 'fire') as fire_count,
      (SELECT COUNT(*) FROM cheers WHERE run_id = ? AND type = 'like') as like_count,
      (SELECT COUNT(*) FROM cheers WHERE run_id = ? AND type = 'nudge') as nudge_count
  `).get(runId, runId, runId);

  res.json({ success: true, counts });
});

// ==========================================
// STATS & LEADERBOARD API
// ==========================================

app.get('/api/stats', (req, res) => {
  const period = req.query.period || 'week'; // 'today' | 'week' | 'month' | 'all'

  let dateFilter = '';
  if (period === 'today') {
    dateFilter = "DATE(r.created_at, 'localtime') = DATE('now', 'localtime')";
  } else if (period === 'week') {
    dateFilter = "DATE(r.created_at, 'localtime') >= DATE('now', 'localtime', '-6 days')";
  } else if (period === 'month') {
    dateFilter = "strftime('%Y-%m', r.created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')";
  } else {
    dateFilter = "1=1";
  }

  // Leaderboard for selected period
  const leaderboard = db.prepare(`
    SELECT 
      u.id as user_id,
      u.name,
      u.avatar,
      COALESCE(SUM(r.distance), 0) as total_distance,
      COALESCE(COUNT(r.id), 0) as run_count,
      COALESCE(SUM(r.duration_seconds), 0) as total_duration,
      MIN(CASE WHEN r.distance >= 3 THEN r.pace_seconds ELSE NULL END) as best_pace_seconds,
      ROUND(AVG(r.pace_seconds)) as avg_pace_seconds
    FROM users u
    LEFT JOIN runs r ON u.id = r.user_id AND ${dateFilter}
    GROUP BY u.id
    ORDER BY total_distance DESC, total_duration ASC
  `).all();

  // Team aggregated stats for period
  const teamAgg = db.prepare(`
    SELECT 
      COALESCE(SUM(distance), 0) as total_team_distance,
      COALESCE(COUNT(id), 0) as total_team_runs,
      COALESCE(SUM(duration_seconds), 0) as total_team_duration,
      ROUND(AVG(pace_seconds)) as avg_team_pace
    FROM runs r
    WHERE ${dateFilter}
  `).get();

  // Monthly goal progress
  const monthlyGoalKm = parseFloat(getSetting('team_monthly_goal_km', '250'));
  const monthCurrent = db.prepare(`
    SELECT COALESCE(SUM(distance), 0) as total
    FROM runs
    WHERE strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')
  `).get().total;

  // Recent 7 days chart data
  const chartDays = db.prepare(`
    WITH RECURSIVE dates(date) AS (
      SELECT DATE('now', 'localtime', '-6 days')
      UNION ALL
      SELECT DATE(date, '+1 day') FROM dates WHERE date < DATE('now', 'localtime')
    )
    SELECT 
      d.date,
      strftime('%m/%d', d.date) as display_date,
      COALESCE(SUM(r.distance), 0) as total_distance
    FROM dates d
    LEFT JOIN runs r ON DATE(r.created_at, 'localtime') = d.date
    GROUP BY d.date
    ORDER BY d.date ASC
  `).all();

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
// SETTINGS & LINE TESTING API
// ==========================================

app.get('/api/settings', (req, res) => {
  const lineToken = getSetting('line_channel_access_token');
  const lineTarget = getSetting('line_group_id');
  const teamGoal = getSetting('team_monthly_goal_km', '250');
  const botName = getSetting('bot_name', '跑友圈打卡小幫手');

  res.json({
    hasToken: Boolean(lineToken && lineToken.length > 20),
    line_channel_access_token: lineToken ? `${lineToken.substring(0, 10)}...${lineToken.slice(-6)}` : '',
    line_group_id: lineTarget,
    team_monthly_goal_km: teamGoal,
    bot_name: botName
  });
});

app.post('/api/settings', (req, res) => {
  const { line_channel_access_token, line_group_id, team_monthly_goal_km, bot_name } = req.body;

  if (line_channel_access_token !== undefined && !line_channel_access_token.includes('...')) {
    setSetting('line_channel_access_token', line_channel_access_token.trim());
  }
  if (line_group_id !== undefined) {
    setSetting('line_group_id', line_group_id.trim());
  }
  if (team_monthly_goal_km !== undefined) {
    setSetting('team_monthly_goal_km', String(parseFloat(team_monthly_goal_km) || 250));
  }
  if (bot_name !== undefined) {
    setSetting('bot_name', bot_name.trim());
  }

  res.json({ success: true, message: '設定已成功儲存' });
});

// Test LINE push
app.post('/api/settings/test-line', async (req, res) => {
  const { line_channel_access_token, line_group_id } = req.body;
  const token = line_channel_access_token && !line_channel_access_token.includes('...') 
    ? line_channel_access_token.trim() 
    : getSetting('line_channel_access_token');
  const target = line_group_id ? line_group_id.trim() : getSetting('line_group_id');

  if (!token || !target) {
    return res.status(400).json({
      success: false,
      error: '請提供完整的 LINE Channel Access Token 與目標 Group ID / User ID'
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

  const clientUrl = `${req.protocol}://${req.get('host')}`;
  const flexMessage = buildFlexMessage(dummyRun, dummyRunner, clientUrl);
  const textFallback = buildTextMessage(dummyRun, dummyRunner, clientUrl);

  const result = await sendLinePushMessage({
    token,
    to: target,
    flexMessage,
    textFallback
  });

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🏃 RunSync Server running at http://localhost:${PORT}`);
});
