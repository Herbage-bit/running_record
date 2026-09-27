import { queryOne } from './db.js';

// 未設定時使用 LIFF 驗證；開發時在 .env 設定 AUTH_MODE=dev 以 DEV_LINE_ID 模擬登入
export const AUTH_MODE = process.env.AUTH_MODE === 'dev' ? 'dev' : 'liff';

// Verified ID tokens cached until expiry, so each API call doesn't hit LINE's endpoint
const tokenCache = new Map();

async function verifyLineIdToken(idToken) {
  const cached = tokenCache.get(idToken);
  if (cached && cached.exp * 1000 > Date.now()) return cached;

  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token: idToken, client_id: process.env.LINE_LIFF_CHANNEL_ID || '' })
  });
  if (!res.ok) return null;

  const payload = await res.json();
  const identity = { lineId: payload.sub, displayName: payload.name, pictureUrl: payload.picture, exp: payload.exp };

  if (tokenCache.size > 1000) tokenCache.clear();
  tokenCache.set(idToken, identity);
  return identity;
}

/**
 * 取得請求者的 LINE 身分 { lineId, displayName, pictureUrl }，無法識別時回傳 null。
 * - liff：驗證 Authorization: Bearer <LIFF ID Token>
 * - dev ：X-Dev-Line-Id header (方便切換身分測試)，否則使用 DEV_LINE_ID
 */
async function resolveIdentity(req) {
  if (AUTH_MODE === 'dev') {
    const lineId = req.get('X-Dev-Line-Id') || process.env.DEV_LINE_ID;
    return lineId ? { lineId, displayName: null, pictureUrl: null } : null;
  }
  const match = /^Bearer (.+)$/.exec(req.get('Authorization') || '');
  return match ? verifyLineIdToken(match[1]) : null;
}

// 首次登入自動建立待審核成員；只有 active 成員可通過，並把成員資料掛到 req.member
export async function requireMember(req, res, next) {
  try {
    const identity = await resolveIdentity(req);
    if (!identity) {
      return res.status(401).json({ error: 'LINE 登入驗證失敗，請重新開啟頁面', code: 'UNAUTHENTICATED' });
    }

    let member = await queryOne('SELECT * FROM members WHERE line_id = $1', [identity.lineId]);
    if (!member) {
      member = await queryOne(
        `INSERT INTO members (line_id, name, avatar) VALUES ($1, $2, $3)
         ON CONFLICT (line_id) DO UPDATE SET line_id = EXCLUDED.line_id
         RETURNING *`,
        [identity.lineId, (identity.displayName || '新跑友').slice(0, 50), identity.pictureUrl || null]
      );
    }

    if (member.status !== 'active') {
      return res.status(403).json({
        error: '已送出加入申請，請等待管理員核准',
        code: 'PENDING_APPROVAL',
        name: member.name
      });
    }

    req.member = member;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, res, next) {
  if (req.member?.position !== 'admin') {
    return res.status(403).json({ error: '僅限管理員操作', code: 'FORBIDDEN' });
  }
  next();
}
