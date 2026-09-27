// LINE LIFF 登入：取得 ID Token 供後端驗證身分
const RELOGIN_FLAG = 'liffRelogin';

export async function initLiff(liffId) {
  if (!liffId) throw new Error('尚未設定 LINE_LIFF_ID');
  // Loaded lazily so dev mode doesn't pull in the SDK
  const { default: liff } = await import('@line/liff');
  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
    return new Promise(() => {}); // page is navigating to LINE login
  }
  return liff.getIDToken();
}

// ID Token 過期 / 無效時重新登入一次；已重試過則回傳 false，避免無限重導
export async function reloginLiff() {
  let retried = false;
  try {
    retried = sessionStorage.getItem(RELOGIN_FLAG) === '1';
    sessionStorage.setItem(RELOGIN_FLAG, '1');
  } catch {
    // sessionStorage unavailable; fall through and try once
  }
  if (retried) return false;

  const { default: liff } = await import('@line/liff');
  liff.logout();
  liff.login({ redirectUri: window.location.href });
  return true;
}

export function clearReloginFlag() {
  try {
    sessionStorage.removeItem(RELOGIN_FLAG);
  } catch {
    // ignore
  }
}
