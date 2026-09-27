import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env (Node >= 20.12 built-in)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

if (!process.env.DATABASE_URL) {
  throw new Error('缺少 DATABASE_URL，請參考 .env.example 建立 .env');
}

// NUMERIC / BIGINT (COUNT, SUM) come back as strings by default; parse them as numbers
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => parseInt(v, 10));

export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Taipei';

// Session timezone makes `timestamptz::date` resolve to the local calendar day
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  options: `-c timezone=${APP_TIMEZONE}`
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function queryOne(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

export async function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  // Bootstrap: 確保 ADMIN_LINE_ID 永遠是已核准的管理員
  const adminLineId = process.env.ADMIN_LINE_ID;
  if (adminLineId) {
    await pool.query(
      `INSERT INTO members (line_id, status, position, name) VALUES ($1, 'active', 'admin', $2)
       ON CONFLICT (line_id) DO UPDATE SET status = 'active', position = 'admin'`,
      [adminLineId, process.env.ADMIN_NAME || '管理員']
    );
  }
}

export default pool;
