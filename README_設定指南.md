# MARK 行動查經：設定與使用指南

這是一個可放上 GitHub Pages 的靜態網站，並以 Firebase Authentication（匿名登入）及 Realtime Database 同步房間、參加者、分數和排行榜。

## 已完成的功能

- 主持人選擇課堂並建立六位房間碼
- 團友使用手機輸入房間碼及暱稱
- 主持人控制「等待／開始／結束」
- 每人獨立作答，不設速度加分
- 每答一題即時同步分數和進度
- 主持人及所有參加者看到即時排行榜
- 答對 80% 或以上顯示獎勵提示
- 第一課十條問題及解釋已加入
- 題庫與網頁程式分開，方便逐課新增
- Firebase 未設定前仍可使用「單機示範」

---

## A. 先試玩網站

所有檔案必須放在同一資料夾。由於網站使用 JavaScript Module，不建議以 `file://` 雙擊開啟；最容易的方法是先上載 GitHub Pages。

Firebase 尚未設定時，首頁的「單機示範試玩」仍可測試第一課全部題目。

---

## B. 設定 Firebase 即時多人模式

### 1. 建立 Firebase 專案

1. 登入 Firebase Console。
2. 建立新專案。
3. Google Analytics 可選擇不啟用。
4. 在專案首頁按「Web」圖示，註冊 Web App。
5. Firebase 會提供一段 `firebaseConfig`。

### 2. 修改 firebase-config.js

打開 `firebase-config.js`，把 Firebase 提供的設定逐項貼入：

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

`databaseURL` 必須存在。它會在你建立 Realtime Database 後顯示。

Firebase Web Config 會出現在公開網站程式中，這是正常的；真正控制資料存取的是 Authentication 和 Database Security Rules。不要把私人密碼、服務帳戶金鑰或牧養紀錄放入程式庫。

### 3. 啟用匿名登入

1. Firebase Console → Authentication。
2. 開啟 Sign-in method。
3. 啟用 Anonymous／匿名登入。

團友不需要建立帳戶，Firebase 會為每部裝置建立臨時匿名身分。

### 4. 建立 Realtime Database

1. Firebase Console → Realtime Database。
2. 建立資料庫。
3. 選擇合適地區。
4. 建議先使用 Locked mode。
5. 建立後，把資料庫網址貼到 `firebase-config.js` 的 `databaseURL`。

### 5. 發布安全規則

1. Realtime Database → Rules。
2. 開啟本資料夾的 `database.rules.json`。
3. 複製整段內容到 Rules 頁面。
4. 按 Publish。

規則容許：
- 已匿名登入的使用者讀取房間排行榜
- 主持人建立及控制自己的房間
- 參加者只能寫入自己的暱稱、分數和進度
- 主持人可管理房內參加者資料

本網站只應使用暱稱；不要要求青少年填電話、電郵、地址或私人牧養資料。

---

## C. 上載 GitHub Pages

### 1. 建立程式庫

1. 登入 GitHub。
2. 建立新的 Public repository，例如 `mark-gospel-quiz`。
3. 把本資料夾內所有檔案上載到 repository 根目錄。
4. 確保根目錄有 `index.html`。

### 2. 開啟 Pages

1. Repository → Settings。
2. 左側選 Pages。
3. Build and deployment → Source 選 `Deploy from a branch`。
4. Branch 選 `main`，資料夾選 `/ (root)`。
5. 儲存。

網站網址通常是：

`https://你的GitHub名稱.github.io/mark-gospel-quiz/`

更新 GitHub 檔案後，網站可能需要數分鐘才顯示新版。

---

## D. 每週實際使用

### 主持人

1. 開網站，按「我是主持人」。
2. 選擇課堂並建立房間。
3. 把加入連結或六位房間碼傳給團友。
4. 等大家加入後按「開始問答」。
5. 投影主持人畫面，可同步顯示排行榜。
6. 結束時按「結束本局」。

### 團友

1. 開啟主持人提供的連結，或在網站按「加入問答」。
2. 輸入房間碼及暱稱。
3. 等待主持人開始。
4. 每題作答後閱讀經文解釋。
5. 完成後查看分數及排行榜。

測試多人功能時，請用兩部裝置，或使用一般瀏覽器加無痕視窗。相同瀏覽器設定檔會共用同一個匿名身分。

---

## E. 新增第二課及之後的題目

題目全部放在 `lessons.js`；`lessonTemplate.js` 是複製範本。

### correctIndex 對照

- A = 0
- B = 1
- C = 2
- D = 3

新增課堂後，重新上載／Commit `lessons.js`，主持人選單便會顯示該課。

```js
{
  id: "m02-q01",
  reference: "馬可福音 1:14",
  text: "在此輸入問題",
  options: ["選項 A", "選項 B", "選項 C", "選項 D"],
  correctIndex: 0,
  explanation: "在此輸入答題後顯示的簡短經文解釋。"
}
```

---

## F. 設計取捨

- 不設答題速度加分，避免閱讀較慢的團友吃虧。
- 每題十分，方便青少年理解分數。
- 排行榜先按分數，再按完成進度。
- 同分而同進度時，先完成者排前，但沒有額外分數。
- 未完成進度會保存在該裝置的瀏覽器。
- 不設永久會員帳戶，也不要求真名。
- GitHub Pages 負責展示網頁；跨裝置同步由 Firebase Realtime Database 處理。

---

## G. 常見問題

### 顯示「單機示範」
代表 `firebase-config.js` 尚未填妥，或 Firebase 初始化失敗。

### 顯示「連線失敗」
檢查 firebaseConfig、databaseURL、Anonymous Authentication 及 Database Rules。

### 團友找不到房間
檢查房間碼是否六位、房間是否已結束，以及裝置能否上網。

### 網站更新後仍是舊版
GitHub Pages 可能需要數分鐘發布；可稍後重新整理或用無痕視窗測試。
