import React, { useState } from 'react';
import { Flame, Plus, Settings, UserCheck, MessageSquare, ChevronDown } from 'lucide-react';

export default function Navbar({
  users,
  currentUser,
  onSelectUser,
  onOpenLogModal,
  onOpenSettings,
  hasLineToken,
  onAddUser
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    onAddUser(newUserName.trim());
    setNewUserName('');
    setIsAddingUser(false);
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

        {/* User Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* User Switcher Dropdown */}
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
              {currentUser && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #10B981'
                  }}
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {currentUser ? currentUser.name : '選擇跑者'}
                </span>
              </div>
              <ChevronDown size={14} color="#94A3B8" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                minWidth: '220px',
                background: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '8px',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', padding: '4px 8px', fontWeight: 600 }}>
                  切換打卡跑者身份
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      background: currentUser?.id === u.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentUser?.id === u.id ? '#34D399' : '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, flex: 1 }}>{u.name}</span>
                    {currentUser?.id === u.id && <UserCheck size={14} color="#10B981" />}
                  </button>
                ))}

                {/* Add new user form */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '6px', paddingTop: '6px' }}>
                  {isAddingUser ? (
                    <form onSubmit={handleCreateUser} style={{ padding: '4px' }}>
                      <input
                        type="text"
                        placeholder="跑者暱稱 (如 小明)"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.8rem',
                          marginBottom: '6px',
                          outline: 'none'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="submit"
                          style={{
                            flex: 1,
                            background: '#10B981',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          確定
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingUser(false)}
                          style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ccc',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAddingUser(true)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#94A3B8',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} /> 新增好友跑者
                    </button>
                  )}
                </div>
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
