import React, { useState } from 'react';
import { Flame, Settings, UserCheck, ChevronDown, UserRound, ShieldCheck, Flag } from 'lucide-react';
import Avatar from './Avatar';

const menuItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  background: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '0.85rem',
  cursor: 'pointer',
  textAlign: 'left'
};

export default function Navbar({
  me,
  members,
  viewingMember,
  onSelectMember,
  onNavigate,
  onOpenSettings,
  hasLineToken
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const go = (route) => {
    onNavigate(route);
    setShowDropdown(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 16px',
      marginBottom: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Flame size={24} color="#052E16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: '1.35rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #ffffff, #6EE7B7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                RunSync
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                跑友圈
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              今天你開跑了嗎？互相監督不偷懶
            </div>
          </div>
        </div>

        {/* Member Viewer & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Member Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                padding: '6px 12px 6px 6px',
                color: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Avatar src={me.avatar} name={me.name} size={28} style={{ border: '1.5px solid #10B981' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{me.name}</span>
              <ChevronDown size={14} color="#94A3B8" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                minWidth: '220px',
                maxHeight: '70vh',
                overflowY: 'auto',
                background: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '8px',
                zIndex: 200
              }}>
                <button onClick={() => go('profile')} style={menuItemStyle}>
                  <UserRound size={15} color="#94A3B8" /> 個人資料
                </button>
                {me.position === 'admin' && (
                  <button onClick={() => go('members')} style={menuItemStyle}>
                    <ShieldCheck size={15} color="#94A3B8" /> 成員管理
                  </button>
                )}
                {me.position === 'admin' && (
                  <button onClick={() => go('races')} style={menuItemStyle}>
                    <Flag size={15} color="#94A3B8" /> 賽事管理
                  </button>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '6px 0' }} />
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', padding: '4px 8px', fontWeight: 600 }}>
                  查看跑者成績
                </div>
                {members.map((m) => {
                  const active = viewingMember?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMember(m);
                        setShowDropdown(false);
                      }}
                      style={{
                        ...menuItemStyle,
                        gap: '10px',
                        background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: active ? '#34D399' : '#F8FAFC'
                      }}
                    >
                      <Avatar src={m.avatar} name={m.name} size={26} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, flex: 1 }}>
                        {m.name}{m.id === me.id ? '（我）' : ''}
                      </span>
                      {active && <UserCheck size={14} color="#10B981" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* LINE Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="LINE 推播與系統設定"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              padding: '8px 12px',
              color: '#F8FAFC',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <Settings size={16} color="#94A3B8" />
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              LINE 連線
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: hasLineToken ? '#10B981' : '#F59E0B'
              }} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
