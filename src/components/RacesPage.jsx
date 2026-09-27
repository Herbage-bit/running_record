import React, { useState } from 'react';
import { ArrowLeft, Flag, Plus, Save, Pencil, Trash2 } from 'lucide-react';
import { createRace, updateRace, deleteRace } from '../services/api';
import { formatRaceDate } from './RaceCountdown';

const DEFAULT_START_TIME = '07:00';
const EMPTY_FORM = { name: '', date: '', time: DEFAULT_START_TIME };

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

// 管理員專用：新增 / 編輯 / 刪除賽事，首頁會顯示最近一場的倒數計時
export default function RacesPage({ races, onChanged, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (race) => {
    const [date, time] = race.start_local.split('T');
    setForm({ name: race.name, date, time });
    setEditingId(race.id);
    setError('');
  };

  const run = async (action) => {
    setSaving(true);
    setError('');
    try {
      await action();
      await onChanged();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) {
      setError('請填寫賽事名稱與日期');
      return;
    }
    const body = { name: form.name.trim(), start_local: `${form.date}T${form.time || DEFAULT_START_TIME}` };
    const ok = await run(() => (editingId ? updateRace(editingId, body) : createRace(body)));
    if (ok) resetForm();
  };

  const handleDelete = async (id) => {
    const ok = await run(() => deleteRace(id));
    if (ok) {
      setConfirmDeleteId(null);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="glass-card page-panel">
      <button type="button" className="btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> 返回
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Flag size={22} color="#F59E0B" />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>賽事管理</h2>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        設定目標賽事後，首頁會顯示最近一場賽事的倒數計時；賽事當天結束後自動從首頁隱藏。
      </p>

      {/* Create / edit form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label className="form-label" htmlFor="race-name">賽事名稱</label>
          <input
            id="race-name"
            className="form-input"
            type="text"
            value={form.name}
            maxLength={100}
            onChange={setField('name')}
            placeholder="例如：臺北馬拉松"
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 160px' }}>
            <label className="form-label" htmlFor="race-date">賽事日期</label>
            <input id="race-date" className="form-input" type="date" value={form.date} onChange={setField('date')} />
          </div>
          <div style={{ flex: '1 1 110px' }}>
            <label className="form-label" htmlFor="race-time">鳴槍時間</label>
            <input id="race-time" className="form-input" type="time" value={form.time} onChange={setField('time')} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn-volt" disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
            {editingId ? <><Save size={16} /> 儲存變更</> : <><Plus size={16} /> 新增賽事</>}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>取消編輯</button>
          )}
        </div>
        {error && <div className="form-error">{error}</div>}
      </form>

      {/* Race list */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>所有賽事（{races.length}）</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {races.length === 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>尚未設定任何賽事</div>
        )}
        {races.map((r) => (
          <div key={r.id} style={{ ...rowStyle, opacity: r.upcoming ? 1 : 0.55, borderColor: editingId === r.id ? 'rgba(16, 185, 129, 0.5)' : undefined }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700 }}>{r.name}</span>
                {!r.upcoming && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>已結束</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatRaceDate(r.start_local)}</div>
            </div>

            {confirmDeleteId === r.id ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn-secondary" disabled={saving} onClick={() => handleDelete(r.id)} style={{ color: '#F87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}>
                  確認刪除
                </button>
                <button type="button" className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                  取消
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn-secondary" onClick={() => startEdit(r)} title="編輯賽事">
                  <Pencil size={15} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => setConfirmDeleteId(r.id)} title="刪除賽事">
                  <Trash2 size={15} color="#F87171" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
