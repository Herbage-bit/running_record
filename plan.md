# 跑步紀錄與好友督促社群平台 (RunSync / 跑友圈) - 專案執行計畫 (plan.md)

本文件為專案的完整執行規劃與架構設計，記錄了系統核心理念、技術架構、功能規格、LINE 推播策略與實作步驟，以利後續啟動開發。

---

## 🎯 一、 產品定位與核心理念

### 1. 核心痛點
- **自己跑容易放棄**：跑步最難的是穿上跑鞋出門的那一刻。單純的記帳工具缺乏社交壓力和即時正向回饋。
- **LINE 群組激勵效果最強**：平時朋友圈或跑團都在 LINE 群中交流，如果某人跑完能「自動發布精美戰報」到群組，並附上挑釁/激勵語（如：「*我今天頂著風跑了 10K，配速 5'15''，某某某換你了！*」），最能有效點燃大家的運動熱情與勝負欲。

### 2. 解決方案
- **極簡打卡**：跑者只需花 15 秒輸入里程、時間/配速、心率與一句話。
- **自動推播 LINE 戰報**：後端即時推播包含跑者大頭貼、里程、配速徽章的 **LINE Flex Message（圖文卡片）** 至指定群組。
- **社群數據中心**：日、週、月跑量排行榜與「團隊合力累積挑戰」（例如：本週全員目標合跑 100km）。

---

## 🏗️ 二、 系統架構設計

```
+-------------------------------------------------------------+
|                      前端應用 (Frontend)                     |
|           React + Vite + Tailwind / Modern CSS              |
|   - 跑者打卡彈窗 (自動雙向換算配速)                              |
|   - 好友動態牆 (點擊拍手/催跑)                                  |
|   - 日/週/月排行榜與統計圖表 (Chart.js / Recharts)              |
|   - LINE Flex Message 擬真預覽器                             |
+------------------------------+------------------------------+
                               | REST API (JSON)
+------------------------------v------------------------------+
|                      後端服務 (Backend)                      |
|                  Node.js + Express.js                       |
|   - 跑者與跑步紀錄 CRUD 模組                                   |
|   - 日/週/月跑量聚合統計演算法                                 |
|   - LINE Flex Message 組裝引擎                               |
               |                               |
        PostgreSQL 資料庫                LINE Messaging API
      (pg 連線池 / 關聯儲存)            (推播至好友群組 / 群組 Bot)
```

---

## 📲 三、 LINE 訊息整合架構 (關鍵評估)

> **重要說明**：官方 LINE Notify 已於 2025 年 3 月底終止服務。因此本專案採用現代化的 **LINE Messaging API (Push / Multicast / Flex Message)**。

### 1. 推播訊息規格 (Flex Message)
- **視覺亮點**：宛如運動手錶 App 戰報（深黑底色 + 螢光綠文字）。
- **包含欄位**：
  - 跑者姓名與頭像
  - 🏃 今日里程（特大醒目數字，如 `8.52 km`）
  - ⏱️ 平均配速（如 `5'20" /km`）與總耗時
  - ❤️ 平均心率（如 `154 bpm`）
  - 💬 跑者激勵喊話：「*今天跑得超爽，換你們了，別想偷懶！*」
  - 🔗 快捷按鈕：【點我看今日排行榜】、【我也要打卡】

### 2. 彈性配置模式
1. **正式模式**：在後端或設定頁面填入 `LINE Channel Access Token` 與 `Group ID / User ID`，打卡即自動發送。
2. **模擬/預覽模式（Mock Mode）**：即使尚未申請 LINE Token，系統內部提供 100% 擬真的 LINE 戰報卡片預覽，並支援「一鍵 LINE 分享（LINE Share Target Picker / Web Share）」，隨時可用。

---

## 📊 四、 資料庫欄位規劃 (PostgreSQL)

### 1. `users` (跑者資料表)
| 欄位名稱 | 型態 | 說明 |
|---|---|---|
| `id` | SERIAL | 主鍵 (PK) |
| `name` | VARCHAR(50) | 跑者暱稱 (如 Kevin、Alex) |
| `avatar` | TEXT | 頭像網址或預設樣式 |
| `line_user_id` | VARCHAR(64) | 對應的 LINE User ID (唯一索引) |
| `line_display_name` | VARCHAR(100) | 跑者的 LINE 顯示名稱 |
| `created_at` | TIMESTAMPTZ | 建立時間 |

### 2. `runs` (跑步打卡紀錄表)
| 欄位名稱 | 型態 | 說明 |
|---|---|---|
| `id` | SERIAL | 主鍵 (PK) |
| `user_id` | INTEGER | 外鍵關聯 `users.id` (ON DELETE CASCADE) |
| `distance` | NUMERIC(6, 2) | 跑步里程 (公里，如 5.25) |
| `duration_seconds` | INTEGER | 跑步總耗時 (秒數) |
| `pace_seconds` | INTEGER | 平均每公里秒數 (由系統自動換算) |
| `heart_rate` | INTEGER | 平均心率 (bpm) |
| `run_type` | VARCHAR(20) | 跑步類型 (路跑 / 操場 / 跑步機 / 越野) |
| `photo_url` | TEXT | (選填) 運動截圖或現場照片 |
| `quote` | TEXT | 給朋友的喊話激勵語 |
| `created_at` | TIMESTAMPTZ | 跑步打卡時間 |

### 3. `cheers` (社群互動表)
| 欄位名稱 | 型態 | 說明 |
|---|---|---|
| `id` | SERIAL | 主鍵 (PK) |
| `run_id` | INTEGER | 關聯 `runs.id` (ON DELETE CASCADE) |
| `user_name` | VARCHAR(50) | 給讚或打氣的朋友暱稱 |
| `type` | VARCHAR(20) | 互動類型 (`fire` 給讚 / `clap` 拍手) |
| `created_at` | TIMESTAMPTZ | 互動時間 |

---

## 🖥️ 五、 功能模組規格

### 模組 1：跑步打卡 (Run Log Entry)
- **自動換算**：輸入「里程」與「時長」，自動推算「平均配速」；亦可直接輸入配速換算時長。
- **預設激勵語選單**：
  - 「今天天氣超好，換你們了！」
  - 「再不出門跑步，本週排行榜第一名我就拿走囉 😉」
  - 「下雨天也阻擋不了我，該你開跑了！」
  - （支援自由編輯自訂話語）
- **打卡觸發推播**：點擊【立即打卡並通知 LINE】，送出資料並同步發送戰報。

### 模組 2：社群動態牆 (Social Feed)
- 最新跑步動態流，卡片式呈現好友戰報。
- 互動按鈕：
  - 🔥 「狂！給個讚」
  - 🔔 「催促開跑」（向今日尚未打卡的朋友發出俏皮提醒）

### 模組 3：統計分析中心與排行榜 (Leaderboard & Stats)
- **統計維度切換**：【今日】、【本週】、【本月】、【年度】。
- **好友排行榜**：
  - 🥇 總里程王 (Total Distance)
  - ⚡ 均速極速王 (Fastest Pace)
  - 📅 出勤勤勞王 (Active Days)
- **團隊挑戰進度**：
  - 例如：「9 月份好友圈合力挑戰 300km」，視覺化動態進度條與個人貢獻比例。
- **跑量趨勢圖**：每日里程長條圖與跑量曲線。

### 模組 4：LINE 設定與管理介面
- 設定 LINE Channel Access Token 與 Target Group ID。
- 提供【發送測試訊息】按鈕，確認 Bot 與群組連線正常。
- 提供【LINE Bot 申請與建置步驟教學】。

---

## 🎨 六、 UI/UX 視覺設計

- **設計風格**：深黑運動科技美學（Nike Run Club / Strava 暗色模式）。
- **配色計畫**：
  - 背景：`#0b0f17` (沉浸深黑) / 卡片 `#141c2b`
  - 主強調色：`#10b981` (電光螢光綠 Volt Green) - 代表活力與開跑
  - 次強調色：`#f59e0b` (熾熱橙 Energetic Orange) - 代表心率與衝刺
  - 文字色：`#f8fafc` (高對比白) / `#94a3b8` (灰字)
- **字型與排版**：現代無襯線運動字體（Inter / Outfit），數字使用等寬 Tabular Numbers，凸顯里程與配速。
- **響應式**：針對手機螢幕（375px ~ 430px）與桌面螢幕做最佳化自適應。

---

## 📁 七、 專案檔案結構規劃

```
running_record/
├── plan.md                    # 本執行計畫文件
├── package.json               # 專案相依與前後端同步啟動指令
├── server/                    # 後端 (Express API)
│   ├── index.js               # 主伺服器入口與 API
│   ├── db.js                  # PostgreSQL 連線池 (pg Pool) 與資料庫操作
│   ├── schema.sql             # PostgreSQL 資料表結構與索引定義檔
│   ├── lineService.js         # LINE Messaging API 推播與 Flex Message 產生器
│   └── uploads/               # 跑者照片儲存目錄
├── src/                       # 前端 (React + Vite)
│   ├── main.jsx               # 前端入口
│   ├── App.jsx                # 主應用程式介面
│   ├── index.css              # 運動暗色風全域樣式與動畫
│   ├── components/
│   │   ├── Navbar.jsx         # 頂部跑者切換與統計概覽
│   │   ├── RunLogModal.jsx    # 打卡輸入彈窗 (配速換算與發送 LINE)
│   │   ├── ActivityFeed.jsx   # 好友打卡動態牆與互動
│   │   ├── Leaderboard.jsx    # 日/週/月排行榜
│   │   ├── StatsCharts.jsx    # 跑量趨勢視覺化圖表
│   │   ├── TeamGoal.jsx       # 團隊目標累積挑戰進度條
│   │   ├── LineSettings.jsx   # LINE Token 設定與推播測試
│   │   └── FlexPreview.jsx    # LINE 戰報卡片即時擬真預覽
│   └── services/
│       └── api.js             # 前端 API 串接模組
└── vite.config.js             # Vite 前端設定
```

---

## 🚀 八、 明日執行啟動清單 (To-do List)

當您準備好時，可直接指示開始，我們將按以下步驟執行：
1. [ ] **專案初始化**：建立 `package.json`，安裝前後端相依套件 (`vite`, `react`, `express`, `pg`, `lucide-react` 等)。
2. [ ] **後端與資料庫建置**：建立 `server/db.js`、`server/index.js`，包含 PostgreSQL 連線池、初始跑者與示範數據。
3. [ ] **LINE 戰報模組**：撰寫 `server/lineService.js`，實作 Flex Message 卡片排版與群組推播。
4. [ ] **前端暗黑運動風介面**：建構打卡彈窗、好友動態牆、日/週/月排行榜與團隊目標進度。
5. [ ] **端到端測試**：驗證打卡、配速計算、排行榜統計更新與 LINE 戰報推播/預覽功能。
