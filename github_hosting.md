# GitHub Actions 自動部署前端到 Firebase Hosting

本文件說明如何讓 RunSync 前端在 **push 到 GitHub 後自動 build 並部署到 Firebase Hosting**，以及每個步驟背後的原因。

- Firebase 專案 ID：`resume-bb01e`
- 前端網址：https://resume-bb01e.web.app
- GitHub repo：`Herbage-bit/running_record`

---

## 0. 整體架構：先理解「誰在做什麼」

```
你的電腦 ──git push──▶ GitHub ──觸發 Actions──▶ GitHub 雲端機器
                                                  │ npm ci
                                                  │ npm run build  (產生 dist/)
                                                  ▼
                                          Firebase Hosting (resume-bb01e.web.app)
                                                  │ 瀏覽器載入前端
                                                  ▼
                                          使用者 ──API 請求──▶ 後端 (ngrok / 正式主機)
```

**為什麼要這樣做？**

- **Firebase Hosting 只是一個放靜態檔案的地方**。它只收 `npm run build` 產生的 `dist/` 資料夾，不會幫你跑 Node.js 後端，也不在乎檔案是從哪台電腦上傳的。
- **手動部署**的流程是：在某台電腦上 build，再執行 `firebase deploy`。缺點是每台電腦都要裝 firebase-tools 並登入，而且容易忘記部署，或部署到還沒 commit 的程式碼。
- **自動部署**改由 GitHub 的雲端機器負責 build 和部署。只要程式碼推上 `main`，網站就會更新，所以「線上版本」一定等於「GitHub 上 main 的版本」。之後不管用哪台電腦開發，都只需要 `git push`。
- **前端和後端是分開部署的**：前端放在 Firebase，後端在你的電腦（透過 ngrok）或之後的正式主機上。因為兩者不在同一個網域，程式碼要做一些調整（見第 1 節）。

---

## 1. 程式碼調整（已完成）

本機開發時，`vite.config.js` 的 proxy 會把 `/api`、`/uploads` 轉到 `localhost:3001`。**這個 proxy 只在 `npm run dev` 時存在**，build 出來部署到 Firebase 後就沒有了，前端的 `/api/...` 請求會打到 Firebase，而 Firebase 上沒有 API，所以一定會失敗。因此做了以下調整：

### 1-1. API 位址改用環境變數（`src/services/api.js`）

```js
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
const API_BASE = `${BACKEND_URL}/api`;
```

- **原因**：正式環境需要完整的後端網址（例如 `https://xxx.ngrok-free.app/api`）。本機開發時沒設定 `VITE_BACKEND_URL`，值是空字串，所以還是 `/api`，照樣走 Vite proxy，開發方式不受影響。
- Vite 只會把 **`VITE_` 開頭**的變數放進前端程式碼。這是 Vite 的安全機制，避免把 `.env` 裡的資料庫密碼之類打包給瀏覽器。

### 1-2. ngrok 警告頁處理

```js
const EXTRA_HEADERS = BACKEND_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {};
```

- **原因**：免費版 ngrok 對來自瀏覽器的請求，會先回傳一個「你確定要造訪嗎？」的 HTML 警告頁。前端收到的是 HTML 而不是 JSON，API 就會壞掉。請求帶上這個 header，ngrok 就會直接把請求轉給後端。換成正式後端後網址不含 `ngrok`，就不會再帶這個 header。

### 1-3. 大頭照網址補上後端位址（`assetUrl()`）

- **原因**：後端存的大頭照路徑是相對路徑 `/uploads/avatars/xxx.jpg`。前端在 `resume-bb01e.web.app` 上時，瀏覽器會到 Firebase 找這張圖，結果找不到。`assetUrl()` 會把 `/uploads/...` 補成 `https://後端網址/uploads/...`。
- 已套用在 `Avatar.jsx`、`ActivityFeed.jsx`、`FlexPreviewModal.jsx`、`Leaderboard.jsx`。

### 1-4. 新增的設定檔

| 檔案 | 內容 | 為什麼需要 | 要 commit 嗎 |
|---|---|---|---|
| `firebase.json` | Hosting 的設定：上傳 `dist`，所有路徑都導向 `index.html` | 告訴 Firebase 要上傳哪個資料夾。React 是單頁應用（SPA），重新整理 `/profile` 這類路徑時，Firebase 上沒有對應檔案，要導回 `index.html` 交給 React 處理，否則會出現 404 | ✅ 要 |
| `.firebaserc` | 預設專案 `resume-bb01e` | 讓 CLI 和 GitHub Actions 知道要部署到哪個 Firebase 專案 | ✅ 要 |
| `.env.production` | `VITE_BACKEND_URL=後端網址` | `npm run build` 時 Vite 會自動讀取。GitHub 的機器上沒有你的 `.env`，所以 build 需要的值必須放在 repo 裡 | ✅ 要（只放可公開的值） |
| `.env` | 資料庫密碼、LINE Token 等 | 後端用的機密資料 | ❌ **絕對不要** |

> **為什麼 `.env.production` 可以 commit？** 前端程式碼會被下載到每個使用者的瀏覽器，任何放進前端的值本來就是公開的。後端網址本來就看得到，所以沒有洩漏問題。**千萬不要把密碼、Token 放進任何 `VITE_` 變數。**

---

## 2. 準備後端（測試期用 ngrok）

### 2-1. 申請 ngrok 免費固定網址

ngrok Dashboard → **Domains** → 申請一個免費網域，例如 `xxx.ngrok-free.app`。

- **原因**：ngrok 預設每次啟動都會給一個隨機網址。前端的後端網址是 **build 時寫死在程式碼裡**的，網址一變，就要改 `.env.production`、push、重新部署。用固定網域就不必每次重來。

### 2-2. 填入網址

- `.env.production`：`VITE_BACKEND_URL=https://xxx.ngrok-free.app`
- 後端的 `.env`：`PUBLIC_BASE_URL=https://xxx.ngrok-free.app`

**原因**：前端靠第一個值找到 API。後端用第二個值產生**完整網址**的圖片連結，因為 LINE 戰報這類外部服務只接受完整的 https 網址。

### 2-3. ⚠️ 關閉 dev 登入模式

把後端 `.env` 裡的 `AUTH_MODE=dev` 刪除或註解掉，並確認 `LINE_LIFF_ID`、`LINE_LIFF_CHANNEL_ID` 都有填。

- **原因**：`dev` 模式不驗證身分，直接把請求者當成 `DEV_LINE_ID`（管理員）。在本機開發時這樣很方便，但透過 ngrok 對外開放後，**任何知道網址的人都能用管理員身分操作**，可以刪除成員、修改資料。關掉之後，後端會改成驗證 LINE 登入的 ID Token。

### 2-4. 啟動後端與 ngrok

```bash
# 終端機 1：啟動後端（port 3001）
npm run dev:backend

# 終端機 2：把公開網址轉到本機 3001
ngrok http --url=xxx.ngrok-free.app 3001
```

**驗證**：用瀏覽器打開 `https://xxx.ngrok-free.app/api/config`，看到 JSON 就代表成功。

- **原因**：你的電腦在家用網路後面，外部連不進來。ngrok 會在你的電腦和 ngrok 伺服器之間建立一條通道，把公開網址收到的請求轉到你的 `localhost:3001`。
- **限制**：電腦關機、後端停掉或 ngrok 關掉，網站就拿不到資料。**ngrok 只適合測試**，正式上線要把後端搬到一台會一直開著的主機。

---

## 3. 設定 Firebase 與 GitHub 自動部署（只需做一次）

### 3-1. 安裝並登入 Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

- **原因**：接下來要由 CLI 幫你在 Google Cloud 建立部署用的服務帳號，並設定 GitHub，所以要先用你的 Google 帳號登入，證明你有 `resume-bb01e` 這個專案的權限。
- 這一步只需要在「做設定的那台電腦」上做一次。完成之後，日常部署不需要 CLI。

### 3-2. 執行 GitHub 整合設定

```bash
firebase init hosting:github
```

| 問題 | 回答 | 原因 |
|---|---|---|
| GitHub repository | `Herbage-bit/running_record` | 指定要在哪個 repo 設定自動部署 |
| Set up the workflow to run a build script before every deploy? | **Yes** | `dist/` 在 `.gitignore` 裡，不會推上 GitHub，所以 GitHub 的機器必須自己 build |
| What script should be run? | `npm ci && npm run build` | `npm ci` 會嚴格照 `package-lock.json` 安裝，比 `npm install` 更快更穩定，每次 build 的套件版本都一樣 |
| Set up automatic deployment when a PR is merged? | **Yes** | push 或合併到 `main` 時自動部署正式網站 |
| What is the name of the GitHub branch associated with your site's live channel? | `main` | 指定哪個分支代表正式版 |

過程中會打開瀏覽器，請你授權 GitHub。

**這個指令在背後做了什麼？**

1. **在 Google Cloud 建立服務帳號**（`github-action-xxxx@resume-bb01e.iam.gserviceaccount.com`）
   - 原因：GitHub 的機器不能用你的個人 Google 帳號登入。服務帳號是給程式使用的帳號，而且**只有部署 Hosting 的權限**。萬一外洩，損害也有限。
2. **產生服務帳號金鑰，存進 GitHub repo 的 Secrets**（名稱類似 `FIREBASE_SERVICE_ACCOUNT_RESUME_BB01E`）
   - 原因：金鑰等同於部署權限的密碼。Secrets 是加密儲存的，只有 workflow 執行時能讀到，不會出現在程式碼或 log 裡。
3. **產生兩個 workflow 檔**
   - `.github/workflows/firebase-hosting-merge.yml`：push 到 `main` 時 build 並部署到正式網址
   - `.github/workflows/firebase-hosting-pull-request.yml`：開 PR 時部署到一個**臨時預覽網址**，讓你合併前先看效果，不影響正式網站

> **GitHub 和 Firebase 的帳號（email）不同可以嗎？** 可以。兩者是分開授權的，CLI 會各自請你登入，彼此不需要是同一個 email。

### 3-3. Commit 並推上 GitHub

```bash
git add .
git commit -m "Firebase Hosting + GitHub Actions 自動部署"
git push
```

- **原因**：workflow 檔、`firebase.json`、`.firebaserc`、`.env.production` 都要放在 repo 裡，GitHub 的機器才拿得到。這次 push 本身也會觸發第一次部署。

### 3-4. 確認部署結果

到 GitHub repo → **Actions** 分頁：
- 🟢 綠勾：部署成功，打開 https://resume-bb01e.web.app 確認
- 🔴 紅叉：點進去看是哪個步驟失敗（常見問題見第 6 節）

### 3-5. 更新 LINE LIFF 的 Endpoint URL

LINE Developers Console → 你的 LINE Login Channel → **LIFF** → Endpoint URL 改成 `https://resume-bb01e.web.app`

- **原因**：使用者從 LINE 打開 LIFF 連結時，LINE 會導向 Endpoint URL。沒改的話，會繼續開啟舊網址或本機網址。

---

## 4. 日常開發流程（任何一台電腦都一樣）

```bash
git pull                 # 先拿到最新版本，避免衝突
# ...修改程式...
npm run dev              # 本機測試（走 Vite proxy，不受 .env.production 影響）
git add .
git commit -m "說明這次改了什麼"
git push                 # 推上去後自動部署
```

**換一台新電腦開發時**：

```bash
git clone git@github.com:Herbage-bit/running_record.git
cd running_record
npm install
# 如果要在這台跑後端，自己建立 .env（參考 .env.example），因為 .env 不在 GitHub 上
```

- 新電腦**不需要**安裝 firebase-tools，也不需要登入 Firebase，部署全部交給 GitHub。
- 不需要回到原本的電腦。

---

## 5. 之後換成正式後端

1. 把後端部署到正式主機，取得網址，例如 `https://api.example.com`
2. 修改 `.env.production`：`VITE_BACKEND_URL=https://api.example.com`
3. 修改後端 `.env` 的 `PUBLIC_BASE_URL`
4. `git push`，前端就會自動用新網址重新部署

- **原因**：後端網址是在 **build 時**寫進前端程式碼的，不是執行時才讀取，所以換網址後一定要重新 build。透過 push 觸發自動部署就會完成這件事。

---

## 5-1. ngrok 網址變了（沒有固定網域時）要改的地方

| # | 位置 | 改成 | 改完要做什麼 |
|---|---|---|---|
| 1 | `.env.production` 的 `VITE_BACKEND_URL` | 新的 ngrok 網址 | commit + push，等 GitHub Actions 綠勾（前端要重新 build，新網址才會寫進程式碼） |
| 2 | 後端 `.env` 的 `PUBLIC_BASE_URL` | 新的 ngrok 網址 | 重啟後端（`.env` 只在啟動時讀取） |
| — | LIFF Endpoint URL | **不用改**，維持 `https://resume-bb01e.web.app` | 前提是它指向 Firebase，而不是 ngrok |

- 本機的 `dist/` 不需要重新 build。前端由 Firebase 提供，只要 LIFF 沒有指向 ngrok，就不會用到本機的 `dist/`。
- 已經推播出去的 LINE 戰報，大頭照用的是舊網址，會變成破圖。這是正常的，新的戰報不受影響。
- 在 ngrok 網址失效、到 Actions 部署完成之前，網站會顯示「無法連線到伺服器」。

---

## 6. 常見問題排除

### 6-1. `firebase init hosting:github` 出現 `Service account ... does not exist`（HTTP 404）

```
Error: Request to https://iam.googleapis.com/v1/projects/resume-bb01e/serviceAccounts/github-action-xxxx@.../keys
had HTTP Error: 404, Service account ... does not exist.
```

- **原因**：CLI 建立服務帳號後，馬上就要幫它產生金鑰。新專案的 Google Cloud IAM 需要幾秒到幾十秒才同步完成，所以產生金鑰時還找不到剛建立的帳號。**跟 GitHub 和 Firebase 的 email 不同無關。**
- **解法 1**：等 1～2 分鐘後重新執行 `firebase init hosting:github`，通常就會成功。
- **解法 2（一直失敗時，改成手動）**：
  1. [Google Cloud Console → IAM → 服務帳戶](https://console.cloud.google.com/iam-admin/serviceaccounts?project=resume-bb01e)，點進 `github-action-xxxx`
  2. 「金鑰」→「新增金鑰」→ JSON，下載金鑰檔
  3. GitHub repo → Settings → Secrets and variables → Actions → New repository secret
     - Name：`FIREBASE_SERVICE_ACCOUNT_RESUME_BB01E`
     - Value：貼上 JSON 的完整內容
  4. 手動建立 `.github/workflows/` 下的兩個 workflow 檔（見附錄）
  5. **刪除電腦上的 JSON 金鑰檔，千萬不要 commit**，因為它等同部署權限的密碼
- **收尾**：重試可能會留下幾個沒用到的 `github-action-xxxx` 服務帳號。對照 GitHub Secrets 實際使用的那一個，其他的可以刪除。

### 6-2. 網站打得開，但一直顯示「無法連線到伺服器」

依序檢查：
1. 後端和 ngrok 是否都有在跑？
2. 用瀏覽器打開 `https://xxx.ngrok-free.app/api/config`，有沒有看到 JSON？
3. `.env.production` 的網址是否正確？改完之後有沒有 push？
4. 瀏覽器按 F12 → Console / Network，看請求打到哪個網址、出現什麼錯誤

### 6-3. 大頭照顯示成姓名首字

免費版 ngrok 對圖片請求也可能回傳警告頁，而 `<img>` 標籤沒辦法加上自訂 header。換成正式後端後就會正常，測試期間可以先忽略。

### 6-4. 重新整理頁面出現 404

確認 `firebase.json` 裡有 `"rewrites": [{ "source": "**", "destination": "/index.html" }]`。

### 6-5. GitHub Actions 在 `npm ci` 失敗

`npm ci` 要求 `package-lock.json` 和 `package.json` 一致。在本機執行一次 `npm install`，把更新後的 `package-lock.json` 一起 commit 再 push。

---

## 附錄：workflow 檔範例（手動建立時使用）

`.github/workflows/firebase-hosting-merge.yml`

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_RESUME_BB01E }}
          channelId: live
          projectId: resume-bb01e
```

`.github/workflows/firebase-hosting-pull-request.yml`

```yaml
name: Deploy to Firebase Hosting on PR
on: pull_request
permissions:
  checks: write
  contents: read
  pull-requests: write
jobs:
  build_and_preview:
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_RESUME_BB01E }}
          projectId: resume-bb01e
```

- `channelId: live` 代表部署到正式網址。PR 版本沒有指定 channelId，會自動建立一個臨時預覽網址，並把連結留言在 PR 上。
- PR 版本的 `if` 條件是為了避免別人 fork 你的 repo 後發 PR 時，workflow 拿你的 Secrets 去部署。
