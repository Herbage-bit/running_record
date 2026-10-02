import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Flame } from 'lucide-react';
import { formatPace, formatDuration } from '../utils/format';
import { assetUrl } from '../services/api';

export default function FlexPreviewModal({
  isOpen,
  onClose,
  run
}) {
  if (!isOpen || !run) return null;

  const [copied, setCopied] = useState(false);

  const paceStr = formatPace(run.pace_seconds);
  const durationStr = formatDuration(run.duration_seconds);
  const distStr = Number(run.distance).toFixed(2);
  const runnerName = run.user_name || '好友跑者';
  const quoteStr = run.quote || '今天跑得超過癮！換你們動起來了！';

  const typeLabels = {
    road: '🏃 戶外路跑',
    track: '🏟️ 操場刷圈',
    treadmill: '⚡ 跑步機',
    trail: '🏔️ 越野山徑'
  };
  const typeText = typeLabels[run.run_type] || '🏃 跑步訓練';

  // Format shareable plain text for LINE
  const textMessage = 
`🔥【跑友圈戰報提醒】
今天 ${runnerName} 跑了 ${distStr} 公里，平均配速 ${paceStr}！
💬 ${runnerName} 對大家喊話：「${quoteStr}」

⚡ 該你開跑了，誰是下一位接棒的勇者？
👉 查看今日排行榜：${window.location.origin}`;

  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(textMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="#10B981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>LINE 戰報卡片預覽</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* LINE Chat Bubble Container (Simulated LINE Flex Message) */}
        <div style={{ padding: '20px', background: '#0F172A' }}>
          <div style={{
            background: '#111827',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {/* Flex Header */}
            <div style={{
              background: '#0B0F17',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10B981' }}>
                🔥 跑友圈・戰報已送達
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {typeText}
              </span>
            </div>

            {/* Optional Hero Image */}
            {run.photo_url && (
              <div style={{ maxHeight: '180px', overflow: 'hidden' }}>
                <img src={assetUrl(run.photo_url)} alt="戰報照片" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Flex Body */}
            <div style={{ padding: '16px' }}>
              {/* Runner Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img
                  src={assetUrl(run.user_avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={runnerName}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #10B981' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                    {runnerName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    剛完成了今日跑步打卡！
                  </div>
                </div>
              </div>

              {/* Big Distance Box */}
              <div style={{
                background: '#1E293B',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                  TOTAL DISTANCE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', margin: '4px 0' }}>
                  <span className="stat-number" style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                    {distStr}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#6EE7B7' }}>
                    KM
                  </span>
                </div>

                {/* Sub metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>平均配速</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>{paceStr}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>時長</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>{durationStr}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>心率</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {run.heart_rate ? `${run.heart_rate} bpm` : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation quote */}
              <div style={{
                background: '#1E1E2E',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.82rem',
                color: '#FDE047',
                fontStyle: 'italic',
                marginBottom: '10px'
              }}>
                "{quoteStr}"
              </div>

              <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, textAlign: 'center' }}>
                👉 該你開跑了，誰是下一位接棒的勇者？
              </div>
            </div>

            {/* Flex Simulated Footer */}
            <div style={{
              background: '#0B0F17',
              padding: '10px 14px',
              display: 'flex',
              gap: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                flex: 1,
                background: '#10B981',
                color: '#052E16',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                查看排行榜
              </div>
              <div style={{
                flex: 1,
                background: '#334155',
                color: '#F8FAFC',
                fontWeight: 600,
                fontSize: '0.78rem',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                我也要打卡
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons to share */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            <span>{copied ? '已複製戰報文字' : '複製戰報文字'}</span>
          </button>

          <a
            href={lineShareUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-volt"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <Share2 size={16} />
            <span>以 LINE 分享發送</span>
          </a>
        </div>
      </div>
    </div>
  );
}
