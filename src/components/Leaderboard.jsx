import React, { useState } from 'react';
import { Trophy, Medal, Flame, Zap, Calendar, Award } from 'lucide-react';
import { formatPace, formatDuration } from '../utils/format';
import { assetUrl } from '../services/api';

export default function Leaderboard({
  stats,
  selectedPeriod,
  onChangePeriod
}) {
  const [metricType, setMetricType] = useState('distance'); // 'distance' | 'pace' | 'runs'

  const leaderboard = stats?.leaderboard || [];

  // Sort based on selected metric
  const sortedUsers = [...leaderboard].sort((a, b) => {
    if (metricType === 'pace') {
      // Smallest pace seconds wins (exclude 0 or null)
      const paceA = a.best_pace_seconds || a.avg_pace_seconds || 99999;
      const paceB = b.best_pace_seconds || b.avg_pace_seconds || 99999;
      return paceA - paceB;
    }
    if (metricType === 'runs') {
      return (b.run_count || 0) - (a.run_count || 0);
    }
    return (b.total_distance || 0) - (a.total_distance || 0);
  });

  const topDistance = sortedUsers[0]?.total_distance || 1;

  const periods = [
    { key: 'today', label: '今日戰況' },
    { key: 'week', label: '本週累積' },
    { key: 'month', label: '本月大戰' },
    { key: 'all', label: '歷史年度' }
  ];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={22} color="#F59E0B" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>跑友圈排行榜</h3>
        </div>

        {/* Period Selector Tabs */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '999px',
          padding: '3px',
          display: 'flex',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => onChangePeriod(p.key)}
              style={{
                background: selectedPeriod === p.key ? '#10B981' : 'transparent',
                color: selectedPeriod === p.key ? '#052E16' : '#94A3B8',
                fontWeight: selectedPeriod === p.key ? 700 : 500,
                border: 'none',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setMetricType('distance')}
          style={{
            background: metricType === 'distance' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: metricType === 'distance' ? '#34D399' : '#94A3B8',
            border: metricType === 'distance' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Flame size={14} /> 總跑量霸榜 (KM)
        </button>

        <button
          onClick={() => setMetricType('pace')}
          style={{
            background: metricType === 'pace' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: metricType === 'pace' ? '#38BDF8' : '#94A3B8',
            border: metricType === 'pace' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} /> 均速極速王 (Pace)
        </button>

        <button
          onClick={() => setMetricType('runs')}
          style={{
            background: metricType === 'runs' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: metricType === 'runs' ? '#FBBF24' : '#94A3B8',
            border: metricType === 'runs' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Calendar size={14} /> 打卡出勤王 (次數)
        </button>
      </div>

      {/* Leaderboard List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedUsers.map((user, index) => {
          const isTop1 = index === 0 && (user.total_distance > 0 || user.run_count > 0);
          const isTop2 = index === 1;
          const isTop3 = index === 2;

          const distanceRatio = topDistance > 0 ? ((user.total_distance || 0) / topDistance) * 100 : 0;
          const bestPace = user.best_pace_seconds || user.avg_pace_seconds;

          return (
            <div
              key={user.user_id}
              style={{
                background: isTop1
                  ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(20, 29, 47, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isTop1
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Relative progress bar in background */}
              {metricType === 'distance' && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${distanceRatio}%`,
                    background: isTop1 ? 'rgba(245, 158, 11, 0.06)' : 'rgba(16, 185, 129, 0.04)',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              )}

              {/* Left: Rank & User Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
                {/* Rank Badge */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: isTop1 ? '1.2rem' : '0.9rem',
                  color: isTop1 ? '#FDE047' : isTop2 ? '#E2E8F0' : isTop3 ? '#FDBA74' : '#94A3B8',
                  background: isTop1
                    ? 'rgba(245, 158, 11, 0.25)'
                    : isTop2
                    ? 'rgba(226, 232, 240, 0.15)'
                    : isTop3
                    ? 'rgba(253, 186, 116, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isTop1 ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>

                {/* Avatar & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={assetUrl(user.avatar)}
                    alt={user.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isTop1 ? '2px solid #F59E0B' : '1.5px solid rgba(255,255,255,0.15)'
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>
                        {user.name}
                      </span>
                      {isTop1 && (
                        <span style={{
                          fontSize: '0.65rem',
                          background: '#F59E0B',
                          color: '#000',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 800
                        }}>
                          霸主
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      出勤 {user.run_count || 0} 次 · 均速 {formatPace(user.avg_pace_seconds)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Main Metric Focus */}
              <div style={{ textAlign: 'right', zIndex: 1 }}>
                {metricType === 'distance' && (
                  <div>
                    <div className="stat-number" style={{ fontSize: '1.45rem', fontWeight: 900, color: isTop1 ? '#F59E0B' : '#10B981', lineHeight: 1 }}>
                      {Number(user.total_distance || 0).toFixed(1)}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginLeft: '4px' }}>KM</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      總時長 {formatDuration(user.total_duration)}
                    </div>
                  </div>
                )}

                {metricType === 'pace' && (
                  <div>
                    <div className="stat-number" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38BDF8', lineHeight: 1 }}>
                      {formatPace(bestPace)}
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '4px' }}>/km</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      累積 {Number(user.total_distance || 0).toFixed(1)} km
                    </div>
                  </div>
                )}

                {metricType === 'runs' && (
                  <div>
                    <div className="stat-number" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>
                      {user.run_count || 0}
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '4px' }}>次</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      打卡天數
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
