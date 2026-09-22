// LINE Messaging API and Flex Message Generator Service

/**
 * Format pace in seconds per km to MM'SS"
 */
export function formatPace(seconds) {
  if (!seconds || seconds <= 0) return "--'--\"";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}'${secs < 10 ? '0' : ''}${secs}"`;
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

/**
 * Build a high-tech sporty LINE Flex Message bubble
 */
export function buildFlexMessage(run, runner, appUrl = 'http://localhost:3000') {
  const paceStr = formatPace(run.pace_seconds);
  const durationStr = formatDuration(run.duration_seconds);
  const distanceStr = Number(run.distance).toFixed(2);
  const heartRateStr = run.heart_rate ? `${run.heart_rate} bpm` : '未記錄';
  const quoteStr = run.quote || '今天跑得超暢快！換你們出來動一動了！🔥';

  const typeLabels = {
    road: '🏃 戶外路跑',
    track: '🏟️ 操場刷圈',
    treadmill: '⚡ 跑步機',
    trail: '🏔️ 越野山徑'
  };
  const typeText = typeLabels[run.run_type] || '🏃 跑步訓練';

  const bubble = {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#0B0F17",
      paddingAll: "16px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "🔥 跑友圈・戰報已送達",
              weight: "bold",
              color: "#10B981",
              size: "sm",
              flex: 1
            },
            {
              type: "text",
              text: typeText,
              color: "#94A3B8",
              size: "xs",
              align: "end"
            }
          ]
        }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#111827",
      paddingAll: "20px",
      contents: [
        // Runner Info
        {
          type: "box",
          layout: "horizontal",
          spacing: "md",
          alignItems: "center",
          contents: [
            {
              type: "image",
              url: runner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
              size: "xxs",
              aspectRatio: "1:1",
              aspectMode: "cover"
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: runner.name,
                  weight: "bold",
                  color: "#F8FAFC",
                  size: "md"
                },
                {
                  type: "text",
                  text: "剛完成了今日跑步打卡！",
                  color: "#94A3B8",
                  size: "xs"
                }
              ]
            }
          ]
        },
        // Big Distance Metric Display
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          backgroundColor: "#1E293B",
          cornerRadius: "12px",
          paddingAll: "16px",
          alignItems: "center",
          contents: [
            {
              type: "text",
              text: "TOTAL DISTANCE",
              color: "#64748B",
              size: "xxs",
              weight: "bold"
            },
            {
              type: "box",
              layout: "baseline",
              spacing: "xs",
              contents: [
                {
                  type: "text",
                  text: distanceStr,
                  weight: "bold",
                  color: "#10B981",
                  size: "3xl"
                },
                {
                  type: "text",
                  text: "KM",
                  weight: "bold",
                  color: "#6EE7B7",
                  size: "md"
                }
              ]
            },
            // Sub metrics row
            {
              type: "box",
              layout: "horizontal",
              margin: "md",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  alignItems: "center",
                  contents: [
                    { type: "text", text: "平均配速", color: "#94A3B8", size: "xxs" },
                    { type: "text", text: paceStr, color: "#F8FAFC", weight: "bold", size: "sm" }
                  ]
                },
                {
                  type: "box",
                  layout: "vertical",
                  alignItems: "center",
                  contents: [
                    { type: "text", text: "運動時長", color: "#94A3B8", size: "xxs" },
                    { type: "text", text: durationStr, color: "#F8FAFC", weight: "bold", size: "sm" }
                  ]
                },
                {
                  type: "box",
                  layout: "vertical",
                  alignItems: "center",
                  contents: [
                    { type: "text", text: "平均心率", color: "#94A3B8", size: "xxs" },
                    { type: "text", text: heartRateStr, color: "#F8FAFC", weight: "bold", size: "sm" }
                  ]
                }
              ]
            }
          ]
        },
        // Runner Quote / Nudge
        {
          type: "box",
          layout: "vertical",
          margin: "md",
          backgroundColor: "#1E1E2E",
          cornerRadius: "8px",
          paddingAll: "12px",
          contents: [
            {
              type: "text",
              text: `"${quoteStr}"`,
              color: "#FDE047",
              size: "xs",
              wrap: true,
              style: "italic"
            }
          ]
        },
        {
          type: "text",
          text: "👉 該你開跑了，誰是下一位接棒的勇者？",
          color: "#38BDF8",
          size: "xs",
          weight: "bold",
          margin: "md",
          align: "center"
        }
      ]
    },
    footer: {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      backgroundColor: "#0B0F17",
      paddingAll: "14px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#10B981",
          height: "sm",
          action: {
            type: "uri",
            label: "查看排行榜",
            uri: appUrl
          }
        },
        {
          type: "button",
          style: "secondary",
          color: "#334155",
          height: "sm",
          action: {
            type: "uri",
            label: "我也要打卡",
            uri: `${appUrl}?action=log`
          }
        }
      ]
    }
  };

  // If there is an uploaded photo, inject it as hero
  if (run.photo_url) {
    bubble.hero = {
      type: "image",
      url: run.photo_url,
      size: "full",
      aspectRatio: "16:9",
      aspectMode: "cover"
    };
  }

  return {
    type: "flex",
    altText: `🔥 今日戰報！${runner.name} 跑了 ${distanceStr} km (配速 ${paceStr})，該你開跑了！`,
    contents: bubble
  };
}

/**
 * Generate plain text fallback for LINE notification or direct sharing
 */
export function buildTextMessage(run, runner, appUrl = 'http://localhost:3000') {
  const paceStr = formatPace(run.pace_seconds);
  const distanceStr = Number(run.distance).toFixed(2);
  const quote = run.quote || '今天跑得超過癮！換你們了！';
  return (
    `🔥【跑友圈戰報提醒】\n` +
    `今天 ${runner.name} 跑了 ${distanceStr} 公里，平均配速 ${paceStr}！\n` +
    `💬 ${runner.name} 對大家說：「${quote}」\n\n` +
    `⚡ 該你開跑了，別想偷懶！\n` +
    `👉 點擊查看今日排行榜與打卡：${appUrl}`
  );
}

/**
 * Send push message via LINE Messaging API
 */
export async function sendLinePushMessage({ token, to, flexMessage, textFallback }) {
  if (!token || !to) {
    return {
      success: false,
      reason: 'MISSING_CREDENTIALS',
      message: '尚未設定 LINE Channel Access Token 或 Target Group/User ID'
    };
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        to: to,
        messages: [flexMessage, { type: 'text', text: textFallback }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        reason: 'LINE_API_ERROR',
        status: response.status,
        details: errorData
      };
    }

    return {
      success: true,
      message: '推播成功發送至 LINE！'
    };
  } catch (error) {
    return {
      success: false,
      reason: 'NETWORK_ERROR',
      error: error.message
    };
  }
}
