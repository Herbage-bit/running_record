import React, { useState, useEffect } from 'react';
import { X, Send, Key, Users, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, Save } from 'lucide-react';
import { testLinePush, updateSettings } from '../services/api';

export default function LineSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  if (!isOpen) return null;

  const [token, setToken] = useState(settings?.line_channel_access_token || '');
  const [groupId, setGroupId] = useState(settings?.line_group_id || '');
  const [monthlyGoal, setMonthlyGoal] = useState(settings?.team_monthly_goal_km || '250');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (settings) {
      setToken(settings.line_channel_access_token || '');
      setGroupId(settings.line_group_id || '');
      setMonthlyGoal(settings.team_monthly_goal_km || '250');
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({
        line_channel_access_token: token,
        line_group_id: groupId,
        team_monthly_goal_km: monthlyGoal
      });
      alert('設定已儲存成功！');
    } catch (err) {
      alert('儲存失敗: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testLinePush({
        line_channel_access_token: token,
        line_group_id: groupId
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="#10B981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>LINE 推播與團隊設定</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSave}>
            {/* LINE Channel Access Token */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  LINE Channel Access Token (長期憑證)
                </label>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <HelpCircle size={13} /> {showGuide ? '收起申請教學' : '如何取得？'}
                </button>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="貼上 LINE Developers 取得之長字串 Token..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Target Group ID */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>
                目標群組 Group ID (或個人 LINE User ID)
              </label>
              <input
                type="text"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="例如: C1234567890abcdef... 或 U1234..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
              <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                將建立的 Bot 邀請進朋友群組即可推播；亦可輸入您個人的 User ID 先行測試。
              </p>
            </div>

            {/* Monthly Goal Setting */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>
                跑友圈本月合力目標 (公里)
              </label>
              <input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                min="10"
                max="5000"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#10B981',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Setup Guide Accordion */}
            {showGuide && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '6px' }}>
                  📖 LINE Messaging API 快速申請 5 步驟：
                </div>
                <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>前往 <a href="https://developers.line.biz/" target="_blank" rel="noreferrer" style={{ color: '#38BDF8' }}>LINE Developers Console</a> 登入您的 LINE 帳號。</li>
                  <li>建立一個 Provider（例：跑友圈），接著建立 <b>Messaging API</b> Channel。</li>
                  <li>在 <b>Messaging API</b> 分頁底部的「Channel access token (long-lived)」點擊 Issue 複製產生的金鑰。</li>
                  <li>將該 Channel 的 LINE 官方帳號（QR Code / 帳號）邀請進入您和好友的群組中。</li>
                  <li>在 Webhook 或群組事件中獲取 Group ID 填入上方欄位即可！</li>
                </ol>
                <div style={{ marginTop: '8px', color: '#94A3B8', fontSize: '0.72rem' }}>
                  💡 提示：若您暫時尚未申請 LINE Bot，打卡時系統仍會自動生成擬真的 LINE 戰報卡片，並提供「一鍵分享到 LINE」功能！
                </div>
              </div>
            )}

            {/* Test Push Result Alert */}
            {testResult && (
              <div style={{
                background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: testResult.success ? '1px solid #10B981' : '1px solid #EF4444',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: testResult.success ? '#6EE7B7' : '#FCA5A5'
              }}>
                {testResult.success ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> 測試訊息已成功送出！請查看您的 LINE 群組。
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div>發送失敗：{testResult.error || testResult.message || '請確認 Token 與 Group ID 是否正確'}</div>
                      {testResult.details && (
                        <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>
                          {JSON.stringify(testResult.details)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-volt"
                style={{ flex: 1, padding: '10px' }}
              >
                <Save size={16} /> {saving ? '儲存中...' : '儲存設定'}
              </button>

              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  borderRadius: '999px',
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={15} /> {testing ? '發送測試中...' : '發送測試推播'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
