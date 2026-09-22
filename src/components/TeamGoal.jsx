import React from 'react';
import { Target, Trophy, Flame, TrendingUp, Users } from 'lucide-react';

export default function TeamGoal({ teamStats }) {
  if (!teamStats) return null;

  const currentKm = Number(teamStats.monthCurrentDistance || 0).toFixed(1);
  const goalKm = Number(teamStats.monthlyGoalKm || 250).toFixed(0);
  const progressPercent = Math.min(100, Math.round((currentKm / goalKm) * 100)) || 0;
  const remainingKm = Math.max(0, (goalKm - currentKm)).toFixed(1);

  return (
    <div className="glass-card" style={{
      padding: '20px 24px',
      marginBottom: '28px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 29, 47, 0.95) 100%)'
    }}>
      {/* Background ambient accent */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={22} color="#10B981" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>本月跑友圈合力挑戰目標</h2>
              <span className="badge-volt">
                <Trophy size={12} /> {progressPercent}% 達成
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              朋友圈不分彼此，所有人每一公里都在為團隊累積榮譽！
            </p>
          </div>
        </div>

        {/* Big numbers highlight */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981' }}>
            {currentKm}
          </span>
          <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 600 }}>
            / {goalKm} km
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        width: '100%',
        height: '14px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '999px',
        padding: '2px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        marginBottom: '14px'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #10B981 0%, #00F59B 100%)',
          boxShadow: '0 0 12px rgba(0, 245, 155, 0.5)',
          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>

      {/* Highlights metrics bottom row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        fontSize: '0.82rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>剩餘目標</div>
          <div className="stat-number" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
            {remainingKm > 0 ? `${remainingKm} km` : '🎉 已達成！'}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>團隊累積跑步次數</div>
          <div className="stat-number" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
            {teamStats.total_team_runs || 0} 次出勤
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>團隊平均配速</div>
          <div className="stat-number" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#6EE7B7' }}>
            {teamStats.avg_team_pace ? `${Math.floor(teamStats.avg_team_pace / 60)}'${teamStats.avg_team_pace % 60 < 10 ? '0' : ''}${teamStats.avg_team_pace % 60}"` : '--\'--"'}
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Flame size={18} color="#F59E0B" />
          <div style={{ fontSize: '0.75rem', color: '#FDE047', lineHeight: 1.3 }}>
            {remainingKm > 0 ? `每人再跑 ${(remainingKm / 4).toFixed(1)} km 即可全員破關！` : '狂賀！本月目標大滿貫達成！'}
          </div>
        </div>
      </div>
    </div>
  );
}
