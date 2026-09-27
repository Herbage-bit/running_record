import React, { useState } from 'react';

// 成員大頭照；沒有圖片或載入失敗時顯示姓名首字
export default function Avatar({ src, name = '', size = 28, style = {} }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const base = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    flexShrink: 0,
    ...style
  };

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailedSrc(src)}
        style={{ ...base, objectFit: 'cover' }}
      />
    );
  }

  return (
    <span
      aria-label={name}
      style={{
        ...base,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
        color: '#052E16',
        fontWeight: 800,
        fontSize: `${Math.round(size * 0.42)}px`,
        fontFamily: 'var(--font-family-heading)'
      }}
    >
      {Array.from(name.trim())[0] || '?'}
    </span>
  );
}
