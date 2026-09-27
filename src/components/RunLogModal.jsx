import React, { useState } from 'react';
import { X, Flame, Clock, Heart, MessageSquare, Send, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import Avatar from './Avatar';

export default function RunLogModal({
  isOpen,
  onClose,
  me,
  onSubmitRun,
  hasLineToken
}) {
  if (!isOpen) return null;

  const [distance, setDistance] = useState('5.0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('26');
  const [seconds, setSeconds] = useState('0');
  const [heartRate, setHeartRate] = useState('150');
  const [quote, setQuote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute total duration in seconds
  const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
  const distNum = parseFloat(distance) || 0;

  // Pace calculation in min/sec per km
  const paceSeconds = distNum > 0 && totalSeconds > 0 ? Math.round(totalSeconds / distNum) : 0;
  const paceMins = Math.floor(paceSeconds / 60);
  const paceSecs = paceSeconds % 60;
  const paceDisplay = paceSeconds > 0 ? `${paceMins}'${paceSecs < 10 ? '0' : ''}${paceSecs}"` : "--'--\"";

  // Pace Zone Tag
  const getPaceTag = () => {
    if (paceSeconds === 0) return null;
    if (paceSeconds < 270) return { label: '⚡ 破風極速', color: '#EF4444' };
    if (paceSeconds <= 330) return { label: '🔥 節奏快跑', color: '#F59E0B' };
    if (paceSeconds <= 400) return { label: '🏃 舒適巡航', color: '#10B981' };
    return { label: '🌱 輕鬆慢跑', color: '#38BDF8' };
  };
  const paceTag = getPaceTag();

  // Heart Rate Zone Tag
  const getHrZone = (hr) => {
    const val = parseInt(hr);
    if (!val || val < 90) return null;
    if (val < 120) return 'Z1 恢復區';
    if (val < 140) return 'Z2 燃脂耐力';
    if (val < 160) return 'Z3 有氧核心';
    if (val < 175) return 'Z4 乳酸閾值';
    return 'Z5 無氧極限';
  };

  const handleQuickDistance = (km) => {
    setDistance(String(km));
    // Estimate reasonable duration around 5'15" pace
    const estSec = Math.round(km * 315);
    setHours(String(Math.floor(estSec / 3600)));
    setMinutes(String(Math.floor((estSec % 3600) / 60)));
    setSeconds(String(estSec % 60));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distNum || distNum <= 0) {
      alert('請輸入有效的跑步里程！');
      return;
    }
    if (totalSeconds <= 0) {
      alert('請輸入運動耗時！');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitRun({
        distance: distNum,
        duration_seconds: totalSeconds,
        pace_seconds: paceSeconds,
        heart_rate: heartRate ? parseInt(heartRate) : null,
        run_type: 'road',
        photo_url: photoUrl || null,
        quote: quote.trim() || '今天跑完超爽快，換你們開跑了！🔥',
        notify_line: true
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err) {
      alert('打卡失敗: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={22} color="#10B981" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>跑步打卡・發布戰報</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Runner (always the logged-in member) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Avatar src={me.avatar} name={me.name} size={32} style={{ border: '1.5px solid #10B981' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>打卡跑者</div>
              <div style={{ fontWeight: 700 }}>{me.name}</div>
            </div>
          </div>

          {/* Distance Input & Quick Pills */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>
                今日里程 (公里)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[3, 5, 10, 15, 21.1].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => handleQuickDistance(km)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94A3B8',
                      fontSize: '0.72rem',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      cursor: 'pointer'
                    }}
                  >
                    {km}k
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="150"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 60px 12px 16px',
                  color: '#10B981',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-family-heading)',
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6EE7B7',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                KM
              </span>
            </div>
          </div>

          {/* Duration & Calculated Pace Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '12px',
            marginBottom: '18px'
          }}>
            {/* Time inputs */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                運動時間 (時 / 分 / 秒)
              </label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '30%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 6px',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                />
                <span style={{ color: '#64748B' }}>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="25"
                  style={{
                    width: '35%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 6px',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                />
                <span style={{ color: '#64748B' }}>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="00"
                  style={{
                    width: '35%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 6px',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* Live Pace Display Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#10B981', marginBottom: '2px', fontWeight: 600 }}>
                平均配速 (自動計算)
              </div>
              <div className="stat-number" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8' }}>
                {paceDisplay} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/km</span>
              </div>
              {paceTag && (
                <div style={{ fontSize: '0.7rem', color: paceTag.color, fontWeight: 700, marginTop: '2px' }}>
                  {paceTag.label}
                </div>
              )}
            </div>
          </div>

          {/* Heart Rate */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
              <Heart size={14} color="#EF4444" /> 平均心率 (bpm) (選填)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="80"
                max="220"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="150"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
              />
              {heartRate && (
                <span style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.72rem',
                  color: '#F59E0B',
                  fontWeight: 600
                }}>
                  {getHrZone(heartRate)}
                </span>
              )}
            </div>
          </div>

          {/* Send Message to Running Circle */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>
              <MessageSquare size={14} color="#F59E0B" /> 發送給跑友圈訊息
            </label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="輸入想對跑友說的話 (例如：今天跑完超爽快，換你們了！)"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#FDE047',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Optional Photo URL */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '6px' }}>
              <ImageIcon size={14} /> 戰報配圖或手錶截圖 URL (選填)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... 留空則使用預設戰報樣式"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-volt"
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
          >
            {submitting ? '發布戰報中...' : '🔥 完成打卡並通知跑友圈！'}
          </button>
        </form>
      </div>
    </div>
  );
}
