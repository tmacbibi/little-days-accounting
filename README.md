# 小日子記帳 V1.5.1

V1.5.1 改成 **GitHub Pages + 靜態市場資料**，不再依賴 Cloudflare Pages Function。資料結構仍為 V13，不需重新匯入既有記帳／投資資料。

## 這版解決的兩個問題

1. 新增股票時抓不到中文名稱。
2. 「更新股價」一直顯示行情來源無法取得。

## 新架構

### 股票中文名稱
App 只讀同一個 GitHub Pages 網站內的：

`./data/security-master.json`

這份主檔由 GitHub Actions 每個交易日下午自動向 TWSE / TPEx 更新。App 本身不跨網域打官方 API，因此不受 iPhone Safari / PWA CORS 影響。

V1.5.1 內建 bootstrap 主檔，至少可立即辨識現有常用持股與 `2330 台積電`；第一次 GitHub Action 成功後會擴充成完整市場主檔。

### 每日收盤價
App 只讀：

`./data/latest-quotes.json`

GitHub Actions 每週一到週五 16:30（台灣時間）更新一次。App 按「更新股價」不會直接呼叫 TWSE / TPEx API。

### 本機硬快取規則
若某檔股票今天的正式收盤價已經存在本機：

- 再按「更新股價」時直接跳過該檔。
- App 重開 / PWA 重開後仍有效。
- 不會因重開而重新讀取該檔今日收盤。
- 盤中價不會冒充正式收盤價。

## GitHub Actions

一次性需要把以下檔案放進 repository：

- `.github/workflows/update-market-data.yml`
- `scripts/update-market-data.mjs`
- `scripts/test-market-data.mjs`
- `data/security-master.json`
- `data/latest-quotes.json`

Workflow 支援：

- 每個交易日 16:30 台灣時間自動執行。
- 可從 GitHub Actions 手動 `Run workflow`。
- 第一次加入 workflow / updater script 時會因 push 自動跑一次。
- 取得資料後會自動 commit 更新兩份 JSON。

## 舊 Cloudflare 檔案

舊的 `functions/api/quotes.js` 與 `_routes.json` 已不再被 V1.5.1 使用。它們即使暫時留在 repository 也不會影響 V1.5.1，但之後可刪除以免混淆。

## 驗證方式

部署後先測：

1. 新增股票，輸入 `2330`，應顯示「台積電」。
2. 等 GitHub Action 成功產生 `data/latest-quotes.json` 後，按「更新股價」。
3. 若 JSON 已包含今天交易日收盤價，第二次按更新應顯示「今日收盤價已更新，不重複讀取」。

## 本機測試

```bash
node --check app.js
node scripts/test-market-data.mjs
```


## V1.5.1
- 證券代號第一次查不到時會立即強制重讀 security-master，避免 GitHub Actions 剛更新後仍卡在舊的 10 分鐘記憶體快取。
- 「更新股價」改為開啟行情總覽，可核對加權指數、櫃買指數與目前持股的收盤價／交易日。
- 每日行情檔新增指數與個股漲跌欄位。
