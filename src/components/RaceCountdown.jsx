import React, { useState, useEffect } from 'react';
import { Flag, CalendarDays } from 'lucide-react';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// start_local: "YYYY-MM-DDTHH:MM" (server APP_TIMEZONE)
export function formatRaceDate(startLocal) {
  const [date, time] = startLocal.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${y}/${m}/${d} (${weekday}) ${time}`;
}

function splitRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

function TimeUnit({ value, label }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: 'rgba(0, 0, 0, 0.35)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 4px',
      textAlign: 'center'
    }}>
      <div className="stat-number" style={{ fontSize: 'clamp(1.5rem, 7vw, 2.2rem)', fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1 }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

// 首頁倒數：最近一場賽事大字倒數，其餘即將到來的賽事列在下方
export default function RaceCountdown({ races }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upcoming = races.filter((r) => r.upcoming);
  if (upcoming.length === 0) return null;

  const [next, ...others] = upcoming;
  const remainingMs = new Date(next.start_at).getTime() - now;
  const { days, hours, minutes, seconds } = splitRemaining(remainingMs);

  return (
    <div className="glass-card" style={{
      maxWidth: '780px',
      margin: '0 auto 20px',
      padding: '18px 20px',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(20, 29, 47, 0.95) 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Flag size={20} color="#F59E0B" />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{next.name}</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            鳴槍 {formatRaceDate(next.start_local)}
          </div>
        </div>
      </div>

      {remainingMs > 0 ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <TimeUnit value={days} label="天" />
          <TimeUnit value={hours} label="時" />
          <TimeUnit value={minutes} label="分" />
          <TimeUnit value={seconds} label="秒" />
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 900, color: '#FBBF24', padding: '10px 0' }}>
          🏁 比賽日！全力衝刺，大家加油！
        </div>
      )}

      {others.length > 0 && (
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {others.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <CalendarDays size={14} color="#94A3B8" />
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{r.name}</span>
              <span>{formatRaceDate(r.start_local)}</span>
              <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                還有 {splitRemaining(new Date(r.start_at).getTime() - now).days} 天
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
