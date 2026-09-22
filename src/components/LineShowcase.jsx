import React, { useState } from 'react';
import { MessageSquare, Image as ImageIcon, FileText, CheckCircle2, Sparkles, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';

export default function LineShowcase() {
  const [viewMode, setViewMode] = useState('flex_photo'); // 'flex_photo' | 'flex_clean' | 'text'

  const samplePhoto = 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&auto=format&fit=crop&q=80';

  return (
    <section className="glass-card" style={{
      padding: '28px',
      marginBottom: '32px',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 29, 47, 0.95) 100%)'
    }}>
      {/* Section Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge-volt">
            <Sparkles size={12} /> 核心推播機制說明
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            LINE Messaging API 規格展示
          </span>
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F8FAFC' }}>
          傳送到好友 LINE 的戰報訊息解析
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          跑步打卡後，系統將自動向好友群組發送專屬運動戰報，激勵彼此開跑！以下為傳送格式與內容完整說明：
        </p>
      </div>

      {/* Grid: Left is Phone Preview, Right is Explanation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Simulated LINE Message in Phone */}
        <div>
          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => setViewMode('flex_photo')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'flex_photo' ? '#10B981' : 'transparent',
                color: viewMode === 'flex_photo' ? '#052E16' : '#94A3B8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <ImageIcon size={13} /> 圖文卡片 (含照片)
            </button>
            <button
              onClick={() => setViewMode('flex_clean')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'flex_clean' ? '#10B981' : 'transparent',
                color: viewMode === 'flex_clean' ? '#052E16' : '#94A3B8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <MessageSquare size={13} /> 簡潔卡片 (無照片)
            </button>
            <button
              onClick={() => setViewMode('text')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'text' ? '#10B981' : 'transparent',
                color: viewMode === 'text' ? '#052E16' : '#94A3B8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <FileText size={13} /> 純文字版本
            </button>
          </div>

          {/* Simulated LINE Chat Bubble Container */}
          <div style={{
            background: '#1F2C3F', // Classic LINE dark chat background
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginBottom: '12px' }}>
              LINE 好友群組聊天室
            </div>

            {/* If Text Mode */}
            {viewMode === 'text' ? (
              <div style={{
                background: '#2A394E',
                color: '#F8FAFC',
                borderRadius: '12px 12px 12px 2px',
                padding: '14px 16px',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {`🔥【跑友圈戰報提醒】
今天 Kevin 跑了 8.50 公里，平均配速 5'15"！
💬 Kevin 對大家說：「今天跑完超爽快，換你們了，別想偷懶！🔥」

⚡ 該你開跑了，誰是下一位接棒的勇者？
👉 點擊查看今日排行榜與打卡：
http://localhost:3002`}
              </div>
            ) : (
              /* If Flex Message Mode (Card with or without Hero image) */
              <div style={{
                background: '#111827',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
              }}>
                {/* Header */}
                <div style={{
                  background: '#0B0F17',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>
                    🔥 跑友圈・戰報已送達
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    🏃 戶外路跑
                  </span>
                </div>

                {/* Hero Photo (if flex_photo) */}
                {viewMode === 'flex_photo' && (
                  <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    <img
                      src={samplePhoto}
                      alt="跑步紀錄照片"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#6EE7B7',
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      📷 跑者實拍照片 / 手錶紀錄圖
                    </div>
                  </div>
                )}

                {/* Body */}
                <div style={{ padding: '14px' }}>
                  {/* Runner Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      alt="Kevin"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #10B981' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC' }}>
                        Kevin (我)
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        剛完成了今日跑步打卡！
                      </div>
                    </div>
                  </div>

                  {/* Big Distance Stat Box */}
                  <div style={{
                    background: '#1E293B',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    textAlign: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>
                      TOTAL DISTANCE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                      <span className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981' }}>
                        8.50
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6EE7B7' }}>
                        KM
                      </span>
                    </div>

                    {/* Sub metrics */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '4px',
                      paddingTop: '6px',
                      marginTop: '4px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>平均配速</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC' }}>5'15"</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>總時長</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC' }}>44m 38s</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>平均心率</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#EF4444' }}>152 bpm</div>
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <div style={{
                    background: '#1E1E2E',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    color: '#FDE047',
                    fontStyle: 'italic',
                    marginBottom: '8px'
                  }}>
                    "今天跑完超爽快，換你們了，別想偷懶！🔥"
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700, textAlign: 'center' }}>
                    👉 該你開跑了，誰是下一位接棒的勇者？
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{
                  background: '#0B0F17',
                  padding: '8px 12px',
                  display: 'flex',
                  gap: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    flex: 1,
                    background: '#10B981',
                    color: '#052E16',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    padding: '5px',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    查看排行榜
                  </div>
                  <div style={{
                    flex: 1,
                    background: '#334155',
                    color: '#F8FAFC',
                    fontWeight: 600,
                    fontSize: '0.74rem',
                    padding: '5px',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    我也要打卡
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 3 Key Questions Answered */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Answer 1: What it looks like */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}>1</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
                傳送到好友的 LINE 訊息長什麼樣子？
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', lineHeight: 1.6 }}>
              呈現如同專業運動賽事的**「暗黑科技運動風戰報卡片 (LINE Flex Message)」**。具有深邃黑底、電光綠高對比數字與發光標籤，比一般純文字更具視覺震撼力與社交儀式感！
            </p>
          </div>

          {/* Answer 2: What content is inside */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#F59E0B',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}>2</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
                訊息裡包含哪些具體內容？
              </h3>
            </div>
            <ul style={{ fontSize: '0.82rem', color: '#CBD5E1', paddingLeft: '20px', lineHeight: 1.7 }}>
              <li><b>跑者身份</b>：頭像、跑者暱稱、打卡時間。</li>
              <li><b>核心跑量</b>：超大字體顯示本次跑了多少公里 (KM)。</li>
              <li><b>專業數據</b>：平均配速 (如 5'15"/km)、總耗時、平均心率 (bpm)。</li>
              <li><b>給好友的喊話語</b>：例如「<em>今天跑完超爽快，換你們了，別想偷懶！🔥</em>」。</li>
              <li><b>互動快捷按鈕</b>：點擊直接開啟網頁【查看排行榜】或【我也要打卡】。</li>
            </ul>
          </div>

          {/* Answer 3: Image or text? */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38BDF8',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}>3</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38BDF8' }}>
                可以是圖片還是只能是文字？
              </h3>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#94A3B8', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '6px' }}>
                <b style={{ color: '#F8FAFC' }}>✅ 完全可以放圖片！</b> 系統支援以下兩種彈性形式：
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b>可附帶照片</b>：打卡時若填入/上傳照片網址（例如手錶截圖、沿途美景照），會自動作為卡片頂部 Hero 封面圖！</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b>亦可無照片純卡片</b>：若不放照片，卡片會自動收合封面，以科技感數據方塊呈現。</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b>自動附帶純文字備援</b>：推播時同步包含文字版，即使在不支援圖文卡片的舊裝置上也能清晰讀取。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
