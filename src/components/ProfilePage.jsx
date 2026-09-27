import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Save, UserRound } from 'lucide-react';
import Avatar from './Avatar';
import { updateMe, uploadAvatar } from '../services/api';

const AVATAR_SIZE = 256;

// 讀取圖片檔並置中裁切、縮放成 256x256 JPEG (data URL)，避免上傳原始大圖
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      canvas.getContext('2d').drawImage(
        img,
        (img.width - side) / 2, (img.height - side) / 2, side, side,
        0, 0, AVATAR_SIZE, AVATAR_SIZE
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('無法讀取此圖片檔'));
    };
    img.src = url;
  });
}

export default function ProfilePage({ me, onUpdated, onBack }) {
  const [name, setName] = useState(me.name);
  const [avatarPreview, setAvatarPreview] = useState(null); // 尚未儲存的新大頭照 (data URL)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(me.name);
  }, [me.name]);

  const trimmedName = name.trim();
  const isDirty = trimmedName !== me.name || Boolean(avatarPreview);

  const handlePickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔');
      return;
    }
    try {
      setError('');
      setAvatarPreview(await resizeImage(file));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trimmedName) {
      setError('姓名為必填欄位');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let updated = me;
      if (avatarPreview) {
        updated = await uploadAvatar(avatarPreview);
      }
      if (trimmedName !== me.name) {
        updated = await updateMe({ name: trimmedName });
      }
      setAvatarPreview(null);
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card page-panel">
      <button type="button" className="btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> 返回
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <UserRound size={22} color="#10B981" />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>個人基本資料</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Avatar
            src={avatarPreview || me.avatar}
            name={trimmedName || me.name}
            size={96}
            style={{ border: '2px solid #10B981', boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)' }}
          />
          <div>
            <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Camera size={16} /> {me.avatar || avatarPreview ? '更換大頭照' : '上傳大頭照'}
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {avatarPreview ? '已選擇新照片，按下儲存後生效' : '支援 JPG / PNG / WebP，會自動裁切為正方形'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePickFile}
              hidden
            />
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label" htmlFor="profile-name">姓名</label>
          <input
            id="profile-name"
            className="form-input"
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="顯示在排行榜與戰報上的名稱"
          />
        </div>

        <button type="submit" className="btn-volt" disabled={!isDirty || saving} style={{ opacity: !isDirty || saving ? 0.5 : 1 }}>
          <Save size={16} /> {saving ? '儲存中…' : '儲存變更'}
        </button>
        {error && <div className="form-error">{error}</div>}
      </form>
    </div>
  );
}
