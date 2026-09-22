import React from 'react';
import { Flame, Clock, Heart, Zap, Calendar, TrendingUp } from 'lucide-react';
import { formatPace, formatDuration } from '../utils/format';

export default function UserStatsView({
  currentUser,
  period,
  onChangePeriod,
  runs,
  onOpenLogModal
}) {
  if (!currentUser) return null;

  // Calculate aggregated stats for this user in the current selected period
  const totalDistance = runs.reduce((sum, r) => sum + (Number(r.distance) || 0), 0);
  const totalDuration = runs.reduce((sum, r) => sum + (Number(r.duration_seconds) || 0), 0);
  const runCount = runs.length;

  // Average pace: total duration / total distance
  const avgPaceSeconds = totalDistance > 0 ? Math.round(totalDuration / totalDistance) : 0;

  // Average heart rate
  const hrRuns = runs.filter(r => r.heart_rate && r.heart_rate > 0);
  const avgHeartRate = hrRuns.length > 0 
    ? Math.round(hrRuns.reduce((sum, r) => sum + r.heart_rate, 0) / hrRuns.length)
    : null;

  // Pace Tag
  const getPaceTag = () => {
    if (avgPaceSeconds === 0) return null;
    if (avgPaceSeconds < 270) return { label: '⚡ 破風極速', color: '#EF4444' };
    if (avgPaceSeconds <= 330) return { label: '🔥 節奏快跑', color: '#F59E0B' };
    if (avgPaceSeconds <= 400) return { label: '🏃 舒適巡航', color: '#10B981' };
    return { label: '🌱 輕鬆慢跑', color: '#38BDF8' };
  };
  const paceTag = getPaceTag();

  // Period label & date range description
  const getPeriodDescription = () => {
    const today = new Date();
    const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}`;

    if (period === 'today') {
      return `今日 (${formatDate(today)}) 跑步數據`;
    }
    if (period === 'week') {
      const past6Days = new Date(today);
      past6Days.setDate(today.getDate() - 6);
      return `當週 (${formatDate(past6Days)} ~ ${formatDate(today)}) 跑步數據`;
    }
    if (period === 'month') {
      return `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 本月跑步數據`;
    }
    return '跑步數據';
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Period Selector Segmented Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        padding: '4px',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        <button
          onClick={() => onChangePeriod('today')}
          style={{
            background: period === 'today' ? '#10B981' : 'transparent',
            color: period === 'today' ? '#052E16' : '#94A3B8',
            fontWeight: period === 'today' ? 800 : 600,
            border: 'none',
            borderRadius: '999px',
            padding: '8px 24px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span>今日 (日)</span>
        </button>

        <button
          onClick={() => onChangePeriod('week')}
          style={{
            background: period === 'week' ? '#10B981' : 'transparent',
            color: period === 'week' ? '#052E16' : '#94A3B8',
            fontWeight: period === 'week' ? 800 : 600,
            border: 'none',
            borderRadius: '999px',
            padding: '8px 28px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span>當週 (週)</span>
        </button>

        <button
          onClick={() => onChangePeriod('month')}
          style={{
            background: period === 'month' ? '#10B981' : 'transparent',
            color: period === 'month' ? '#052E16' : '#94A3B8',
            fontWeight: period === 'month' ? 800 : 600,
            border: 'none',
            borderRadius: '999px',
            padding: '8px 24px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span>本月 (月)</span>
        </button>
      </div>

      {/* 2. Big Center Circular CTA Button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '10px 0 16px 0',
        position: 'relative'
      }}>
        {/* Decorative ambient pulsing ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '2px solid rgba(16, 185, 129, 0.25)',
          pointerEvents: 'none'
        }} />

        <button
          onClick={onOpenLogModal}
          className="pulse-glow"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #00F59B 100%)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 0 35px rgba(16, 185, 129, 0.5), 0 0 70px rgba(0, 245, 155, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
            zIndex: 2
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.boxShadow = '0 0 45px rgba(0, 245, 155, 0.7), 0 0 80px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.5), 0 0 70px rgba(0, 245, 155, 0.2)';
          }}
        >
          <Flame size={44} color="#052E16" strokeWidth={2.6} />
          <span style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#052E16',
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            開跑打卡
          </span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#047857',
            letterSpacing: '0.02em'
          }}>
            推播 LINE
          </span>
        </button>
      </div>

      {/* 3. Main Stats Dashboard Card */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.06) 0%, rgba(20, 29, 47, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* User Profile Header (without small button) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px'
        }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #10B981',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC' }}>
                {currentUser.name}
              </h2>
              <span className="badge-volt" style={{ fontSize: '0.72rem' }}>
                {period === 'today' ? '今日數據' : period === 'week' ? '當週累積' : '本月累積'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              {getPeriodDescription()}
            </div>
          </div>
        </div>

        {/* Big 4 Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '14px',
          marginBottom: '18px'
        }}>
          {/* Metric 1: Total Distance */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            padding: '18px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
              TOTAL DISTANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', margin: '4px 0' }}>
              <span className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                {totalDistance.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6EE7B7' }}>
                KM
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              累積總里程數
            </div>
          </div>

          {/* Metric 2: Average Pace */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '14px',
            padding: '18px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
              AVERAGE PACE
            </div>
            <div className="stat-number" style={{ fontSize: '2.1rem', fontWeight: 800, color: '#38BDF8', margin: '6px 0 2px 0', lineHeight: 1 }}>
              {formatPace(avgPaceSeconds)}
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '4px' }}>/km</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: paceTag ? paceTag.color : '#64748B', fontWeight: 600 }}>
              {paceTag ? paceTag.label : '平均每公里配速'}
            </div>
          </div>

          {/* Metric 3: Total Duration */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '18px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
              TOTAL DURATION
            </div>
            <div className="stat-number" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#F8FAFC', margin: '6px 0 2px 0', lineHeight: 1 }}>
              {formatDuration(totalDuration)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              出勤 {runCount} 次跑步
            </div>
          </div>

          {/* Metric 4: Heart Rate */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '14px',
            padding: '18px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
              AVG HEART RATE
            </div>
            <div className="stat-number" style={{ fontSize: '2.1rem', fontWeight: 800, color: avgHeartRate ? '#EF4444' : '#64748B', margin: '6px 0 2px 0', lineHeight: 1 }}>
              {avgHeartRate ? `${avgHeartRate}` : '--'}
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '4px' }}>bpm</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              平均運動心率
            </div>
          </div>
        </div>

        {/* Summary Encouragement Footer Strip */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#CBD5E1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10B981" />
            <span>
              {totalDistance > 0 
                ? `${currentUser.name} 在此時段已累積跑了 ${totalDistance.toFixed(2)} 公里！繼續保持節奏！🔥`
                : '點擊上方圓形按鈕開跑打卡，為自己記錄第一筆跑步里程！'}
            </span>
          </div>
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
            {runCount} 筆打卡
          </span>
        </div>
      </div>
    </div>
  );
}
