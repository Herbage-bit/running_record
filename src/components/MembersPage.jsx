import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, UserPlus, Check, X, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import { fetchPendingMembers, approveMember, deleteMember } from '../services/api';

const POSITION_LABELS = { admin: '管理員', member: '成員' };

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--card-border)',
  flexWrap: 'wrap'
};

function MemberInfo({ member, suffix }) {
  return (
    <>
      <Avatar src={member.avatar} name={member.name} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700 }}>{member.name}</span>
          {suffix}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {member.line_id}
        </div>
      </div>
    </>
  );
}

// 管理員專用：審核加入申請、移除成員
export default function MembersPage({ me, members, onChanged, onBack }) {
  const [pending, setPending] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadPending = useCallback(async () => {
    try {
      setPending(await fetchPendingMembers());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const run = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      await action();
      setConfirmDeleteId(null);
      await Promise.all([loadPending(), onChanged()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="glass-card page-panel">
      <button type="button" className="btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> 返回
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldCheck size={22} color="#10B981" />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>成員管理</h2>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        朋友第一次用 LINE 開啟頁面時會自動送出加入申請，核准後才能使用。移除成員會一併刪除其所有跑步成績。
      </p>
      {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}

      {/* Pending join requests */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <UserPlus size={17} color="#F59E0B" /> 待審核申請
        {pending.length > 0 && <span className="badge-orange" style={{ fontSize: '0.7rem' }}>{pending.length}</span>}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {pending.length === 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>目前沒有待審核的申請</div>
        )}
        {pending.map((m) => (
          <div key={m.id} style={{ ...rowStyle, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <MemberInfo member={m} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="btn-volt" disabled={busyId === m.id} onClick={() => run(m.id, () => approveMember(m.id))} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                <Check size={15} /> 核准
              </button>
              <button type="button" className="btn-secondary" disabled={busyId === m.id} onClick={() => run(m.id, () => deleteMember(m.id))} title="拒絕申請">
                <X size={15} color="#F87171" /> 拒絕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approved members */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>已核准成員（{members.length}）</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {members.map((m) => (
          <div key={m.id} style={rowStyle}>
            <MemberInfo
              member={m}
              suffix={
                <>
                  <span className={m.position === 'admin' ? 'badge-orange' : 'badge-volt'} style={{ fontSize: '0.7rem' }}>
                    {POSITION_LABELS[m.position] || m.position}
                  </span>
                  {m.id === me.id && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(你)</span>}
                </>
              }
            />

            {m.id !== me.id && (
              confirmDeleteId === m.id ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="btn-secondary" disabled={busyId === m.id} onClick={() => run(m.id, () => deleteMember(m.id))} style={{ color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}>
                    確認移除
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                    取消
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => setConfirmDeleteId(m.id)} title="移除成員">
                  <Trash2 size={15} color="#F87171" />
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
