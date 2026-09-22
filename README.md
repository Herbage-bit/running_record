# 🏃 RunSync 跑友圈 (Running Record & Friend Motivation Platform)

> **互相砥礪・全員開跑** —— 專為朋友圈熟人社群打造的極簡跑步打卡、數據統計、LINE LIFF 內嵌無感登入與即時戰報推播應用。

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![LINE LIFF](https://img.shields.io/badge/LINE-LIFF%20v2-00C300.svg)](https://developers.line.biz/en/docs/liff/)
[![LINE Messaging API](https://img.shields.io/badge/LINE-Messaging%20API-00C300.svg)](https://developers.line.biz/)

---

## 📖 目錄
- [一、 專案核心理念](#一-專案核心理念)
- [二、 系統核心特色與畫面設計](#二-系統核心特色與畫面設計)
- [三、 LINE LIFF 整合與無感登入架構](#三-line-liff-整合與無感登入架構)
- [四、 跑步打卡與自動運算機制](#四-跑步打卡與自動運算機制)
- [五、 LINE 戰報推播機制說明](#五-line-戰報推播機制說明)
- [六、 技術架構與資料庫設計](#六-技術架構與資料庫設計)
- [七、 專案目錄結構](#七-專案目錄結構)
- [八、 快速啟動與操作指南](#八-快速啟動與操作指南)
- [九、 未來功能擴充規劃](#九-未來功能擴充規劃)

---

## 一、 專案核心理念

跑步最難的是「穿上跑鞋跨出門的第一步」。個人的記帳工具容易使人鬆懈，但**同溫層朋友的即時激勵與良性競爭（Peer Motivation）**能發揮最強的督促效果：
- **LINE 內極致體驗**：捨棄傳統 Google/Gmail 登入跳轉，直接整合 **LINE LIFF (LINE Front-end Framework)**。跑者在 LINE 官方帳號點擊「輸入今日成績」，直接在 LINE 內彈出打卡視窗，不跳出外部瀏覽器。
- **無感自動登入 (Silent Login)**：系統透過 LINE 身分憑證自動比對 PostgreSQL 資料庫中的 `line_user_id`，已綁定跑者「點開即登入」，0 阻力即刻打卡。
- **15 秒極簡記錄**：跑者只需輸入「里程」與「時間」，配速與數據由系統即時毫秒級換算。
- **LINE 即時戰報**：打卡完成瞬間，官方機器人直接向好友群組發送高質感運動戰報圖文卡片（Flex Message），附帶跑者對朋友的喊話激勵語。

---

## 二、 系統核心特色與畫面設計

### 1. 暗黑運動科技美學 (Dark Sporty Aesthetic)
- 參考 **Nike Run Club / Strava** 設計語言，以深邃夜空黑 (`#090D16`) 為基底，搭配電光螢光綠 (`#10B981`) 與熾熱橙 (`#F59E0B`)。
- 全站採用現代無襯線運動字體（**Outfit & Inter**），數據數字具備等寬對齊特性（Tabular Numbers）。

### 2. 頁面中間巨幅「開跑打卡」按鈕
- 移除了頂部與側邊雜亂的小按鈕，在頁面正中央設置直徑 **150px 的大型立體圓形發光按鈕**。
- 具備呼吸光暈微動畫（`pulse-glow`）與外圈流光光環，使用者開啟網頁第一眼即可直覺點擊開跑。

### 3. 個人時段數據看板（日 / 週 / 月）
- 頂部提供 Segmented Control 快捷切換：
  - ☀️ **今日 (日)**：查看當天的跑步成果。
  - 📅 **當週 (週)（預設選取）**：聚合最近 7 天的跑步累積數據。
  - 🌙 **本月 (月)**：統計本月份的累積總里程與運動狀態。
- **四大核心數據大字看板**：
  1. **總跑量 (Total Distance)**：特大螢光綠字體（如 `12.50 KM`）。
  2. **平均配速 (Average Pace)**：動態換算每公里秒數（如 `5'15" /km`），自動評定速度等級（破風極速 / 節奏快跑 / 舒適巡航 / 輕鬆慢跑）。
  3. **運動總時長 (Total Duration)**：累積時間（如 `1h 05m`）與出勤次數。
  4. **平均心率 (Avg Heart Rate)**：平均心跳數（如 `152 bpm`）。

---

## 三、 LINE LIFF 整合與無感登入架構

本專案完全捨棄 Gmail/第三方帳密登入，全面採用 **LINE LIFF 原生身份整合**：

### 1. 互動體驗亮點
- **原生內嵌視窗（In-App Browser）**：在 LINE 官方帳號圖文選單（Rich Menu）中配置 LIFF URL（如 `https://liff.line.me/{LIFF_ID}`），設定視窗大小為 `Tall` (佔螢幕 75%) 或 `Full`。點擊後直接於聊天室上方滑出打卡介面，完全不跳出 LINE。
- **秒級無感登入**：LIFF 初始化時自動取得當前 LINE 帳號憑證，直接在背景完成身份校驗，跑者無須輸入任何帳號密碼。
- **打卡完自動關閉**：成績送出後，前端可直接調用 `liff.closeWindow()`，優雅關閉視窗回到聊天室，並即刻看見機器人發布的群組戰報。

### 2. 安全驗證時序圖 (ID Token 驗證機制)
為防止惡意竄改 `userId` 冒充他人，系統採取標準的 LINE ID Token 後端檢驗機制：

```mermaid
sequenceDiagram
    autonumber
    actor User as 跑者 (LINE App)
    participant Menu as LINE 官方帳號 (Rich Menu)
    participant LIFF as LIFF 網頁 (React 前端)
    participant Server as 跑步後端 (Node/Express)
    participant LINEAuth as LINE 官方驗證端點
    participant DB as PostgreSQL 資料庫

    User->>Menu: 點擊選單「輸入今日跑步成績」
    Menu->>LIFF: 開啟 LIFF 視窗 (不跳轉外部瀏覽器)
    LIFF->>LIFF: liff.init()
    LIFF->>LIFF: liff.getIDToken() 取得安全 JWT 憑證
    LIFF->>Server: POST /api/auth/line-verify { idToken }
    Server->>LINEAuth: POST https://api.line.me/oauth2/v2.1/verify
    LINEAuth-->>Server: 回傳驗證結果 (含不可偽造的 sub / line_user_id)
    Server->>DB: 查詢 line_user_id 是否存在
    alt 已綁定跑者
        DB-->>Server: 取得使用者資料
        Server-->>LIFF: 驗證成功 + 發放身分憑證
        LIFF-->>User: 自動帶入個人身分，直接跳出打卡輸入框
    else 首次使用 (新用戶)
        DB-->>Server: 查無資料
        Server-->>LIFF: 需首次登記姓名
        LIFF-->>User: 提示「歡迎首次加入！請輸入您的跑者姓名」完成綁定
    end
```

---

## 四、 跑步打卡與自動運算機制

點擊中央圓形「**開跑打卡**」按鈕即開啟極簡打卡彈窗：

| 欄位 | 運作說明 |
| :--- | :--- |
| **今日里程 (KM)** | 必填，支援小數點。提供 `3k`、`5k`、`10k`、`15k`、`21.1k` 快速填寫標籤。 |
| **運動時間 (時:分:秒)** | 必填，填入時、分、秒。 |
| **⚡ 平均配速 (分'秒'' / km)** | **系統自動計算！** 依據里程與時間即時毫秒級演算，完全無需手動計算。 |
| **平均心率 (bpm)** | 選填，輸入後自動提示運動強度分區（Z1恢復 ~ Z5無氧極限）。 |
| **發送給跑友圈訊息** | 純 Placeholder 提示，跑者可隨心輸入對朋友說的話；留空送出時系統會自動填入預設熱血激勵語。 |
| **戰報配圖 / 手錶截圖 URL** | 選填，可填入照片或手錶截圖網址作為 LINE 戰報封面大圖。 |

> **預設自動推播**：點擊「🔥 完成打卡並通知跑友圈！」後一律自動推播至 LINE，並同步在網頁彈出戰報卡片預覽。

---

## 五、 LINE 戰報推播機制說明

### 1. 運作流程：Push API
- **發送戰報**：使用 **LINE Messaging API 的主動推播（Push API）**。後端拿到 Token 與目標群組 ID 後，主動向 LINE 官方發送 HTTP POST 請求（`https://api.line.me/v2/bot/message/push`），官方帳號就會直接在群組發布戰報卡片。
- **單向發布優勢**：無需架設對外公開的 Webhook 接收伺服器，架構單純且反應迅速。

### 2. 戰報卡片（Flex Message）規格
傳送給好友的訊息採用專業的 **LINE Flex Message 圖文卡片**：
1. **封面大圖 (Hero Image)**：若有填入照片/手錶截圖，頂部會以 16:9 比例渲染封面圖；若無則自動收合。
2. **跑者資訊**：跑者頭像、暱稱與打卡時間。
3. **大字數據儀表板**：深色底色 + 綠色大字里程、平均配速、時長、平均心率。
4. **激勵喊話語**：跑者輸入的自訂喊話（如 `「今天跑完超爽快，換你們開跑了！🔥」`）。
5. **接棒提示**：`👉 該你開跑了，誰是下一位接棒的勇者？`。
6. **按鈕**：好友可點擊【我也要打卡】直接連回 LIFF 打卡視窗。
7. **純文字備援 (Text Fallback)**：同步發送排版優雅的文字版訊息，並支援網頁上一鍵複製或 LINE Web Share 分享。

---

## 六、 技術架構與資料庫設計

### 1. 前後端完整架構
```
[LINE 聊天室 / Rich Menu]
        │
        │ 點選「輸入今日跑步成績」開啟 LIFF URL
        ▼
[LIFF 內嵌視窗: React 19 + Vite] (Port: 3002)
        │
        │ 1. liff.getIDToken() 取得安全憑證
        │ 2. POST /api/auth/line-verify 登入
        │ 3. REST API 打卡資料交換 (/api)
        ▼
[後端伺服器: Node.js Express] (Port: 3001)
   ├── 身份核驗: POST https://api.line.me/oauth2/v2.1/verify
   ├── PostgreSQL 資料庫: 連線池 (pg Pool / DATABASE_URL)
   └── LINE Messaging API Client: server/lineService.js
        │
        │ HTTPS POST (Push API with Channel Access Token)
        ▼
[LINE 官方伺服器] ──> [LINE 好友群組 (Flex Message 戰報發布)]
```

### 2. 資料庫資料表 (PostgreSQL)

本專案提供完整 Schema 定義檔 [`server/schema.sql`](file:///c:/Users/kevin.chen/personal_project/running_record/server/schema.sql)，主要資料表如下：

#### ① `users` (跑者身分資料表)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  line_user_id VARCHAR(64) UNIQUE,        -- 跑者的 LINE 唯一識別碼
  line_display_name VARCHAR(100),          -- 跑者的 LINE 顯示名稱
  avatar TEXT,                             -- 頭像 URL (可沿用 LINE 頭像)
  bio TEXT,                                -- 個人激勵座右銘
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### ② `runs` (跑步打卡紀錄表)
```sql
CREATE TABLE runs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  distance NUMERIC(6, 2) NOT NULL,         -- 里程數 (KM)
  duration_seconds INTEGER NOT NULL,       -- 總時間 (秒)
  pace_seconds INTEGER NOT NULL,           -- 每公里秒數 (由系統自動換算)
  heart_rate INTEGER,                      -- 平均心率
  run_type VARCHAR(20) DEFAULT 'road',     -- 跑步類型
  photo_url TEXT,                          -- 配圖或手錶截圖
  quote TEXT,                              -- 喊話激勵語
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### ③ `cheers` (跑友互動加油表)
```sql
CREATE TABLE cheers (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  user_name VARCHAR(50) NOT NULL,
  type VARCHAR(20) DEFAULT 'fire',         -- 互動類型 (fire / clap / heart)
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### ④ `settings` (系統設定鍵值表)
```sql
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
);
```

---

## 七、 專案目錄結構

```
running_record/
├── .env.example               # 環境變數設定範本 (DATABASE_URL, LINE 金鑰)
├── README.md                  # 本專案說明與操作指引 (包含 LIFF 與 PostgreSQL 規格)
├── plan.md                    # 專案執行計畫
├── package.json               # 專案相依套件與執行腳本
├── vite.config.js             # Vite 前端設定與後端 API 代理 (Proxy)
├── index.html                 # 前端 HTML 入口 (包含 Google Fonts 與 LIFF SDK)
├── server/                    # 後端服務
│   ├── index.js               # Express 伺服器、REST API 與 LINE 身分驗證路由
│   ├── db.js                  # PostgreSQL 連線池 (pg Pool) 與查詢封裝
│   ├── schema.sql             # PostgreSQL 資料表初始化與索引腳本
│   └── lineService.js         # LINE Flex Message 產生器與推播呼叫
└── src/                       # 前端應用 (React)
    ├── main.jsx               # React 根節點渲染
    ├── App.jsx                # 主應用控制器 (支援 LIFF 授權與自動載入跑者)
    ├── index.css              # 暗黑運動科技風全域樣式與發光特效
    ├── components/
    │   ├── Navbar.jsx         # 頂部導航 (跑者切換、LINE 設定)
    │   ├── UserStatsView.jsx  # 核心畫面：日/週/月切換、中央圓形打卡按鈕、四大數據看板
    │   ├── RunLogModal.jsx    # 極簡打卡彈窗 (自動算配速、心率、發送跑友圈訊息)
    │   ├── LineSettingsModal.jsx # LINE Token / 群組 ID 設定與一鍵測試推播工具
    │   ├── FlexPreviewModal.jsx  # 1:1 LINE 戰報卡片即時模擬預覽與一鍵分享
    │   └── LineShowcase.jsx   # LINE 訊息規格與圖文說明展示組件
    ├── services/
    │   └── api.js             # 前端 REST API 與 LIFF 登入驗證模組
    └── utils/
        └── format.js          # 配速 (min'sec"/km) 與時間格式化輔助函式
```

---

## 八、 快速啟動與操作指南

### 1. 安裝相依套件
在專案根目錄下執行：
```bash
npm install
```

### 2. 資料庫與環境變數設定 (PostgreSQL)
1. 複製環境變數範本建立 `.env`：
   ```bash
   cp .env.example .env
   ```
2. 設定 PostgreSQL 連線字串（支援本機 PostgreSQL 或雲端如 Supabase / Neon / Railway）：
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/running_record
   ```
3. 匯入資料庫結構：
   可以使用 `psql` 或資料庫管理工具（如 DBeaver, pgAdmin）執行 [`server/schema.sql`](file:///c:/Users/kevin.chen/personal_project/running_record/server/schema.sql)：
   ```bash
   psql -U postgres -d running_record -f server/schema.sql
   ```

### 3. 同步啟動前後端 (開發模式)
```bash
npm run dev
```
此指令會透過 `concurrently` 同時啟動：
- 前端應用：[http://localhost:3002](http://localhost:3002)
- 後端 API：[http://localhost:3001](http://localhost:3001)

### 4. LINE Developers 與 LIFF 設定
1. **建立 LINE Login Channel**：
   - 前往 [LINE Developers Console](https://developers.line.biz/)。
   - 建立一個 Provider 與 **LINE Login** 類型的 Channel。
2. **新增 LIFF App**：
   - 在 LINE Login Channel 底下切換至 **LIFF** 分頁，點擊 **Add**。
   - **Size**：選擇 `Tall` (75% 螢幕高度) 或 `Full`。
   - **Endpoint URL**：填入您的網頁網址（開發時需使用 HTTPS 隧道如 `ngrok` 或 `Cloudflare Tunnel`，例如 `https://your-tunnel.ngrok-free.app`）。
   - **Scopes**：勾選 `profile` 與 `openid`。
3. **設定官方帳號圖文選單 (Rich Menu)**：
   - 在 [LINE Official Account Manager](https://manager.line.biz/) 建立圖文選單。
   - 將「輸入今日跑步成績」區塊的動作類型設為 **連結 (Link)**，填入上述取得的 **LIFF URL**（例如 `https://liff.line.me/1234567890-AbcdEfgh`）。
4. **LINE Messaging API 連線設定（群組推播）**：
   - 在 Messaging API Channel 取得 **Channel Access Token (Long-lived)**。
   - 將官方帳號邀請進入好友群組，取得 `groupId`。
   - 點擊網頁右上角「**LINE 連線**」，填入 Token 與 Group ID 即可開始即時戰報推播！

---

## 九、 未來功能擴充規劃

- [x] **LINE LIFF 內嵌整合與無感登入**：全面取代 Gmail 登入，於 LINE 內直接彈出視窗並自動認證身份。
- [x] **PostgreSQL 企業級關聯資料庫支援**：提供完整的 PostgreSQL DDL Schema 與索引優化。
- [ ] **GPX / FIT 軌跡檔案匯入**：支援直接上傳運動手錶輸出的 GPX 路線檔，自動擷取里程與配速。
- [ ] **朋友排行榜展開檢視**：在個人數據下方提供收合式的小型排行榜，方便查看今日誰已開跑。
- [ ] **跑團成就勳章系統**：達成「連續 3 天晨跑」、「首次半馬 21K」、「月跑量破百」時自動解鎖特殊稱號卡片。
- [ ] **自動週報/月報推播**：每週日晚上自動彙整當週好友圈總結，由 LINE 機器人自動發布當週榮譽榜單。
