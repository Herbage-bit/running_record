// Frontend API service
const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let idToken = null;

// LIFF 模式：登入後設定 ID Token，之後每個請求都帶上
export function setIdToken(token) {
  idToken = token;
}

// 開發模式：localStorage.setItem('devLineId', 'Uxxx') 可切換成其他成員身分測試權限
function authHeaders() {
  if (idToken) return { Authorization: `Bearer ${idToken}` };
  try {
    const devLineId = localStorage.getItem('devLineId');
    return devLineId ? { 'X-Dev-Line-Id': devLineId } : {};
  } catch {
    return {};
  }
}

async function request(path, { method = 'GET', body, fallbackError = '請求失敗' } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...authHeaders(),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new ApiError(data.error || fallbackError, res.status, data.code);
    err.data = data;
    throw err;
  }
  return data;
}

// ---- 登入設定 (公開) ----
export const fetchConfig = () => request('/config', { fallbackError: '無法連線到伺服器' });

// ---- 目前登入者 / 個人資料 ----
export const fetchMe = () => request('/me', { fallbackError: '無法取得登入資訊' });

export const updateMe = (profile) =>
  request('/me', { method: 'PUT', body: profile, fallbackError: '個人資料儲存失敗' });

export const uploadAvatar = (dataUrl) =>
  request('/me/avatar', { method: 'POST', body: { image: dataUrl }, fallbackError: '大頭照上傳失敗' });

// ---- 成員 (白名單) ----
export const fetchMembers = () => request('/members', { fallbackError: '無法取得成員列表' });

export const fetchPendingMembers = () =>
  request('/members/pending', { fallbackError: '無法取得待審核申請' });

export const approveMember = (id) =>
  request(`/members/${id}/approve`, { method: 'POST', fallbackError: '核准失敗' });

export const deleteMember = (id) =>
  request(`/members/${id}`, { method: 'DELETE', fallbackError: '刪除成員失敗' });

// ---- 跑步成績 ----
export function fetchRuns(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(query ? `/runs?${query}` : '/runs', { fallbackError: '無法取得跑步紀錄' });
}

export const createRun = (runData) =>
  request('/runs', { method: 'POST', body: runData, fallbackError: '打卡送出失敗' });

export const cheerRun = (runId, cheerData) =>
  request(`/runs/${runId}/cheer`, { method: 'POST', body: cheerData, fallbackError: '互動送出失敗' });

export const fetchStats = (period = 'week') =>
  request(`/stats?period=${period}`, { fallbackError: '無法取得統計數據' });

// ---- 賽事倒數 ----
export const fetchRaces = () => request('/races', { fallbackError: '無法取得賽事列表' });

export const createRace = (race) =>
  request('/races', { method: 'POST', body: race, fallbackError: '新增賽事失敗' });

export const updateRace = (id, race) =>
  request(`/races/${id}`, { method: 'PUT', body: race, fallbackError: '更新賽事失敗' });

export const deleteRace = (id) =>
  request(`/races/${id}`, { method: 'DELETE', fallbackError: '刪除賽事失敗' });

// ---- 系統設定 ----
export const fetchSettings = () => request('/settings', { fallbackError: '無法取得系統設定' });

export const updateSettings = (settings) =>
  request('/settings', { method: 'POST', body: settings, fallbackError: '設定儲存失敗' });

export const testLinePush = (config) =>
  request('/settings/test-line', { method: 'POST', body: config }).catch((err) => ({
    success: false,
    error: err.message
  }));
