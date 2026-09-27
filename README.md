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

#### ⑤ `races` (目標賽事表，首頁倒數計時)
管理員於「賽事管理」頁面新增 / 編輯 / 刪除；首頁顯示最近一場未結束賽事的倒數（賽事當天結束後自動隱藏）。
```sql
CREATE TABLE races (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,               -- 賽事名稱，例如「臺北馬拉松」
  start_at TIMESTAMPTZ NOT NULL,            -- 賽事日期 + 鳴槍時間 (以 APP_TIMEZONE 輸入)
  created_by INTEGER REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
2. 設定 PostgreSQL 連線字串（資料庫名稱大小寫需與實際一致）：
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/Running_record
   ```
3. 資料表不需手動建立：後端啟動時會自動執行 [`server/schema.sql`](server/schema.sql)（皆為 `IF NOT EXISTS`，可重複執行），並將 `ADMIN_LINE_ID` 設為已核准的管理員。

### 3. 啟動指令說明

| 指令 | 用途 | 啟動內容 | 開啟網址 |
| :--- | :--- | :--- | :--- |
| `npm run dev` | **本機開發**（改程式碼即時生效） | Vite 前端開發伺服器 (3004) + Express 後端 (3001)，前端 `/api` 由 Vite 代理到後端 | [http://localhost:3004](http://localhost:3004) |
| `npm run serve` | **給 LINE / ngrok 使用** | 先 `vite build` 打包前端到 `dist/`，再啟動 Express (3001)，由同一個 port 提供網頁 + API + 大頭照 | [http://localhost:3001](http://localhost:3001) |
| `npm start` | 只啟動 Express（不重新打包） | 使用現有的 `dist/`，適合前端沒改、只重啟後端時 | [http://localhost:3001](http://localhost:3001) |
| `npm run build` | 只打包前端 | 輸出到 `dist/` | — |

> - `dev` 與 `serve` 都會使用 3001 port，**不可同時執行**，切換前先按 `Ctrl+C` 停止。
> - Vite 開發伺服器會阻擋 ngrok 等外部網域（`Blocked request. This host is not allowed`），因此透過 LINE 開啟時務必使用 `npm run serve`，且 ngrok 指向 **3001**。
> - 修改後端程式或 `.env` 後需重新啟動才會生效；修改前端程式後，`serve` 模式需重新執行 `npm run serve` 重新打包。

### 4. LINE Developers 設定（Provider / LINE Login / LIFF）

> **LINE userId 的規則**：userId 以「**人 × Provider**」計算。同一個人在同一 Provider 底下的所有 channel（LINE Login、LIFF、Messaging API 機器人）都是同一個 userId；換到不同 Provider 則不同。因此 RunSync 的 LINE Login channel 與日後推播用的 Messaging API channel **必須建立在同一個 Provider 底下**。

1. **建立 Provider**
   - 前往 [LINE Developers Console](https://developers.line.biz/console/)，以自己的 LINE 帳號登入。
   - 在 **Providers** 區塊點擊 **Create**，輸入名稱（例如 `RunSync`）。
2. **建立 LINE Login Channel**
   - 進入剛建立的 Provider → **Create a new channel** → 選擇 **LINE Login**。
   - **Region**：Taiwan；**App types**：勾選 **Web app**；其餘欄位依畫面填寫後建立。
   - 在 channel 的 **Basic settings** 分頁取得兩個值：
     | Console 欄位 | 位置 | 填入 `.env` |
     | :--- | :--- | :--- |
     | **Channel ID** | Basic settings 上方 | `LINE_LIFF_CHANNEL_ID` |
     | **Your user ID** | Basic settings **最底部**（`U` 開頭 33 碼，即你本人的 userId） | `ADMIN_LINE_ID` |
3. **新增 LIFF App**
   - 在 LINE Login channel 切換到 **LIFF** 分頁 → **Add**：
     | 欄位 | 設定值 |
     | :--- | :--- |
     | LIFF app name | 任意，例如 `RunSync` |
     | Size | `Full`（或 `Tall`） |
     | Endpoint URL | ngrok 的 https 網址，例如 `https://xxxx.ngrok-free.app`（見下方第 6 節） |
     | Scopes | 勾選 **`openid`** 與 **`profile`**（缺少 `openid` 將無法取得 ID Token，登入驗證會失敗） |
   - 建立後複製 **LIFF ID**（格式如 `1234567890-AbcdEfgh`）→ 填入 `.env` 的 `LINE_LIFF_ID`。
   - LIFF 網址為 `https://liff.line.me/{LIFF ID}`，這就是分享給朋友的入口。
4. **Channel 狀態：Developing → Published**
   - 新建立的 channel 為 **Developing**，此時**只有 channel 管理員與 Tester 可以登入**。
   - 自己測試成功後，點擊 channel 頁面上方的 **Developing** 切換為 **Published**，朋友才能登入。

### 5. 開發模式 (dev) 測試流程

開發模式不經過 LINE 登入，用 LINE ID 字串模擬身分，因此**只有一個 LINE 帳號也能測試管理員、一般成員、待審核三種角色**。權限判斷（白名單、審核、管理員限定功能）與正式 LIFF 模式是同一套程式，只有「如何得知你是誰」不同。

#### ① `.env` 設定
```env
AUTH_MODE=dev
DEV_LINE_ID=my_admin_id      # 預設登入身分
ADMIN_LINE_ID=my_admin_id    # 與 DEV_LINE_ID 相同，預設登入即為管理員
```
設定後重新執行 `npm run dev`，開啟 [http://localhost:3004](http://localhost:3004)。

#### ② 切換測試身分
在瀏覽器按 `F12` 開啟 Console 輸入：

| 動作 | Console 指令 |
| :--- | :--- |
| 切換成任意身分（不存在的 ID 會自動成為待審核申請） | `localStorage.setItem('devLineId', 'U_fake_friend'); location.reload();` |
| 切回預設身分（`DEV_LINE_ID`，即管理員） | `localStorage.removeItem('devLineId'); location.reload();` |

#### ③ 完整測試腳本

| 步驟 | 身分 | 操作 | 預期結果 |
| :--- | :--- | :--- | :--- |
| 1 | 管理員 | 開啟首頁 | 正常顯示個人數據；右上角選單有「個人資料」與「成員管理」 |
| 2 | 管理員 | 選單 →「個人資料」修改姓名、上傳大頭照 → 儲存 | 右上角與首頁的姓名、大頭照立即更新 |
| 3 | 新朋友 `U_fake_friend` | 切換身分後重新整理 | 顯示「歡迎加入跑友圈！請等待管理員核准」，看不到任何資料 |
| 4 | 管理員 | 切回管理員 → 選單 →「成員管理」 | 「待審核申請」出現 `新跑友 (U_fake_friend)` |
| 5 | 管理員 | 按「核准」 | 該成員移到「已核准成員」清單 |
| 6 | 新朋友 | 切換回 `U_fake_friend` | 可正常使用；選單**沒有**「成員管理」 |
| 7 | 新朋友 | 點「開跑打卡」送出一筆成績 | 成績記在自己名下（打卡視窗無法選擇其他跑者） |
| 8 | 新朋友 | 選單 →「查看跑者成績」選擇管理員 | 可看到管理員的成績，但該頁**沒有**打卡按鈕 |
| 9 | 管理員 | 切回管理員 →「成員管理」→ 移除 `新跑友` | 該成員與其成績一併刪除 |
| 10 | 另一新朋友 `U_fake_friend2` | 切換身分產生申請 → 切回管理員按「拒絕」 | 申請消失；該 ID 下次開啟會重新送出申請 |

> ⚠️ `X-Dev-Line-Id` 切換身分**只在 `AUTH_MODE=dev` 有效**；正式模式下後端一律只認 LINE 驗證過的 ID Token，無法偽造身分。

### 6. 以 LIFF + ngrok 部署（本機伺服器）

前後端都在本機執行，透過 ngrok 提供 LINE 需要的 https 網址：

```
手機 LINE ──► https://liff.line.me/{LIFF_ID}
                  │ LINE 轉址到 LIFF Endpoint URL
                  ▼
      https://xxxx.ngrok-free.app ──(ngrok 通道)──► localhost:3001
                                                    Express：網頁 (dist/) + API + 大頭照
                                                          │
                                                    PostgreSQL (本機)
```

#### ① 安裝與設定 ngrok
1. 安裝 ngrok（Microsoft Store 或 [ngrok.com/download](https://ngrok.com/download)），並於 [dashboard.ngrok.com](https://dashboard.ngrok.com) 註冊。
2. 在 Dashboard 的 **Your Authtoken** 複製 token 並執行：
   ```bash
   ngrok config add-authtoken <你的 token>
   ```
3. （建議）在 Dashboard → **Domains** 領取一個**免費固定網域**。否則每次重開 ngrok 網址都會改變，必須同步修改 LIFF Endpoint URL 與 `PUBLIC_BASE_URL`。

#### ② 設定 `.env`
```env
# AUTH_MODE=dev                          ← 註解或刪除 (未設定即為 LIFF 模式)
ADMIN_LINE_ID=U1234567890abcdef1234567890abcdef   # Basic settings 最底部的 Your user ID
PUBLIC_BASE_URL=https://xxxx.ngrok-free.app       # ngrok 網址 (戰報中的大頭照需要完整網址)
LINE_LIFF_ID=1234567890-AbcdEfgh                  # LIFF 分頁的 LIFF ID
LINE_LIFF_CHANNEL_ID=1234567890                   # LINE Login channel 的 Channel ID
```

#### ③ 啟動（開兩個終端機）
```bash
# 終端機 1：打包前端並啟動伺服器，看到 "RunSync Server running at http://localhost:3001" 再進行下一步
npm run serve

# 終端機 2：開啟 ngrok 通道，務必指向 3001 (不是 Vite 的 3004)
ngrok http 3001
# 有固定網域時：ngrok http --url=xxxx.ngrok-free.app 3001
```
確認 ngrok 顯示的 `Forwarding https://... -> http://localhost:3001` 網址與 LIFF **Endpoint URL**、`.env` 的 `PUBLIC_BASE_URL` 三者一致。

#### ④ 以管理員帳號測試
1. 在 LINE 將 `https://liff.line.me/{LIFF_ID}` 傳給自己（例如 Keep 筆記）並點開。
2. 首次開啟會出現 LINE 授權畫面 → 按「許可」。
3. 免費版 ngrok 首次會出現警告頁（You are about to visit…）→ 按 **Visit Site**。
4. 應以**管理員**身分進入，右上角選單有「成員管理」。

#### ⑤ 邀請朋友
1. 將 LINE Login channel 切換為 **Published**（見第 4 節第 4 點）。
2. 將 LIFF 網址分享到群組；朋友首次開啟會自動送出加入申請。
3. 管理員至選單 →「成員管理」核准。核准後朋友之後每次開啟都會自動登入，無需再審核。

> 電腦需保持開機，且 `npm run serve` 與 ngrok 兩個終端機都要持續執行，朋友才能連線。

#### ⑥ 常見問題

| 狀況 | 原因 | 解法 |
| :--- | :--- | :--- |
| 畫面顯示 `Blocked request. This host is not allowed`，ngrok 顯示 403 | ngrok 指向 Vite 開發伺服器 (3004) | 停止 `npm run dev`，改用 `npm run serve`，ngrok 指向 **3001** |
| 管理員本人登入卻顯示「等待核准」 | `ADMIN_LINE_ID` 與實際 userId 不同（多半是查錯 Provider） | pgAdmin 執行 `SELECT line_id FROM members WHERE status='pending';`，將查到的 ID 填回 `ADMIN_LINE_ID` 並重新啟動 |
| 顯示「LINE 登入驗證失敗」 | `LINE_LIFF_CHANNEL_ID` 錯誤，或 LIFF Scopes 未勾選 `openid` | 檢查 Channel ID 與 LIFF Scopes |
| 朋友無法登入，但自己可以 | channel 仍為 Developing | 切換為 **Published** |
| 重開 ngrok 後打不開 | ngrok 網址改變 | 更新 LIFF Endpoint URL 與 `PUBLIC_BASE_URL` 後重新 `npm run serve`（或改用固定網域） |

### 7. 後續設定：圖文選單與群組戰報推播（尚未完成）
1. **官方帳號圖文選單 (Rich Menu)**：在 [LINE Official Account Manager](https://manager.line.biz/) 建立圖文選單，動作類型設為 **連結**，填入 LIFF 網址 `https://liff.line.me/{LIFF_ID}`。
2. **群組戰報推播**：需在**同一個 Provider** 底下建立 **Messaging API channel**，取得 **Channel Access Token (Long-lived)**，並將官方帳號邀請進群組。群組的 `groupId` 只能透過 **Webhook** 事件取得，需另外設定。完成後於網頁右上角「**LINE 連線**」填入 Token 與 Group ID。

---

## 九、 未來功能擴充規劃

- [x] **LINE LIFF 內嵌整合與無感登入**：全面取代 Gmail 登入，於 LINE 內直接彈出視窗並自動認證身份。
- [x] **PostgreSQL 企業級關聯資料庫支援**：提供完整的 PostgreSQL DDL Schema 與索引優化。
- [ ] **GPX / FIT 軌跡檔案匯入**：支援直接上傳運動手錶輸出的 GPX 路線檔，自動擷取里程與配速。
- [ ] **朋友排行榜展開檢視**：在個人數據下方提供收合式的小型排行榜，方便查看今日誰已開跑。
- [ ] **跑團成就勳章系統**：達成「連續 3 天晨跑」、「首次半馬 21K」、「月跑量破百」時自動解鎖特殊稱號卡片。
- [ ] **自動週報/月報推播**：每週日晚上自動彙整當週好友圈總結，由 LINE 機器人自動發布當週榮譽榜單。
