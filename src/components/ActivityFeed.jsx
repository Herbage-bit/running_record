import React from 'react';
import { Flame, Clock, Heart, MessageSquare, Share2, Sparkles, BellRing, MapPin } from 'lucide-react';
import { formatPace, formatDuration } from '../utils/format';

export default function ActivityFeed({
  runs,
  onCheer,
  onViewFlex,
  currentUser,
  onOpenLogModal
}) {
  if (!runs || runs.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px auto'
        }}>
          <Flame size={26} color="#10B981" />
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>尚未有跑步紀錄 (已清空 Mock 資料)</div>
        <p style={{ fontSize: '0.82rem', marginTop: '6px', color: '#94A3B8', maxWidth: '320px', margin: '6px auto 16px auto' }}>
          版面已完全淨空。隨時點擊下方按鈕輸入您今天真實的跑步數據，戰報就會同步出現在此！
        </p>
        {onOpenLogModal && (
          <button onClick={onOpenLogModal} className="btn-volt" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
            <Flame size={16} /> 立即開跑打卡
          </button>
        )}
      </div>
    );
  }

  const formatRelativeTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return '剛剛';
      if (diffMins < 60) return `${diffMins} 分鐘前`;
      if (diffHours < 24) return `${diffHours} 小時前`;
      if (diffDays === 1) return '昨天';
      if (diffDays < 7) return `${diffDays} 天前`;
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return '';
    }
  };

  const getRunTypeBadge = (type) => {
    switch (type) {
      case 'track':
        return { label: '🏟️ 操場刷圈', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' };
      case 'trail':
        return { label: '🏔️ 越野山徑', color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)' };
      case 'treadmill':
        return { label: '⚡ 跑步機', color: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)' };
      default:
        return { label: '🏃 戶外路跑', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color="#F59E0B" /> 好友跑步即時動態牆
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
          共 {runs.length} 筆熱血紀錄
        </span>
      </div>

      {runs.map((run) => {
        const typeBadge = getRunTypeBadge(run.run_type);
        const paceStr = formatPace(run.pace_seconds);
        const durationStr = formatDuration(run.duration_seconds);

        return (
          <div key={run.id} className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
            {/* Header: User Info & Time */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={run.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={run.user_name}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(16, 185, 129, 0.4)'
                  }}
                />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
                    {run.user_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {formatRelativeTime(run.created_at)} 完成打卡
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: typeBadge.color,
                background: typeBadge.bg,
                padding: '4px 10px',
                borderRadius: '999px',
                border: `1px solid ${typeBadge.color}33`
              }}>
                {typeBadge.label}
              </span>
            </div>

            {/* Main Stats Banner */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Distance Display */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
                  DISTANCE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span className="stat-number" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                    {Number(run.distance).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6EE7B7' }}>
                    KM
                  </span>
                </div>
              </div>

              {/* Pace */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>平均配速</div>
                <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {paceStr}
                </div>
              </div>

              {/* Duration */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>總時長</div>
                <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {durationStr}
                </div>
              </div>

              {/* Heart rate */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>平均心率</div>
                <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 700, color: run.heart_rate ? '#EF4444' : '#64748B' }}>
                  {run.heart_rate ? `${run.heart_rate} bpm` : '--'}
                </div>
              </div>
            </div>

            {/* Friend Quote Bubble */}
            {run.quote && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                borderLeft: '3px solid #F59E0B',
                borderRadius: '0 8px 8px 0',
                padding: '10px 14px',
                marginBottom: '14px',
                fontSize: '0.88rem',
                color: '#FEF08A',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MessageSquare size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
                <span>"{run.quote}"</span>
              </div>
            )}

            {/* Photo if present */}
            {run.photo_url && (
              <div style={{
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '14px',
                maxHeight: '260px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <img
                  src={run.photo_url}
                  alt="跑步記錄照片"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Social Interactions & LINE Preview button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Fire Cheer */}
                <button
                  onClick={() => onCheer(run.id, 'fire')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#F87171',
                    borderRadius: '999px',
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Flame size={14} /> 給狂讚 ({run.fire_count || 0})
                </button>

                {/* Nudge / Challenge */}
                <button
                  onClick={() => onCheer(run.id, 'nudge')}
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#FBBF24',
                    borderRadius: '999px',
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <BellRing size={14} /> 催他再開跑 ({run.nudge_count || 0})
                </button>
              </div>

              {/* View LINE Flex Message preview */}
              <button
                onClick={() => onViewFlex(run)}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Share2 size={13} /> LINE 戰報卡片
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
