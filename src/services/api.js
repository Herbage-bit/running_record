// Frontend API service
const API_BASE = '/api';

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('無法取得跑者列表');
  return res.json();
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '新增跑者失敗');
  }
  return res.json();
}

export async function fetchRuns(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/runs?${query}` : `${API_BASE}/runs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('無法取得跑步紀錄');
  return res.json();
}

export async function createRun(runData) {
  const res = await fetch(`${API_BASE}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '打卡送出失敗');
  }
  return res.json();
}

export async function cheerRun(runId, cheerData) {
  const res = await fetch(`${API_BASE}/runs/${runId}/cheer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cheerData)
  });
  if (!res.ok) throw new Error('互動送出失敗');
  return res.json();
}

export async function fetchStats(period = 'week') {
  const res = await fetch(`${API_BASE}/stats?period=${period}`);
  if (!res.ok) throw new Error('無法取得統計數據');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('無法取得系統設定');
  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('設定儲存失敗');
  return res.json();
}

export async function testLinePush(config) {
  const res = await fetch(`${API_BASE}/settings/test-line`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}
