# 小日子記帳 V1.5.4

V1.5.4 改成 **GitHub Pages + 靜態市場資料**，不再依賴 Cloudflare Pages Function。資料結構仍為 V13，不需重新匯入既有記帳／投資資料。

## 這版解決的兩個問題

1. 新增股票時抓不到中文名稱。
2. 「更新股價」一直顯示行情來源無法取得。

## 新架構

### 股票中文名稱
App 只讀同一個 GitHub Pages 網站內的：

`./data/security-master.json`

這份主檔由 GitHub Actions 每個交易日下午自動向 TWSE / TPEx 更新。App 本身不跨網域打官方 API，因此不受 iPhone Safari / PWA CORS 影響。

V1.5.4 內建 bootstrap 主檔，至少可立即辨識現有常用持股與 `2330 台積電`；第一次 GitHub Action 成功後會擴充成完整市場主檔。

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

舊的 `functions/api/quotes.js` 與 `_routes.json` 已不再被 V1.5.4 使用。它們即使暫時留在 repository 也不會影響 V1.5.4，但之後可刪除以免混淆。

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


## V1.5.4
- 證券代號第一次查不到時會立即強制重讀 security-master，避免 GitHub Actions 剛更新後仍卡在舊的 10 分鐘記憶體快取。
- 「更新股價」改為開啟行情總覽，可核對加權指數、櫃買指數與目前持股的收盤價／交易日。
- 每日行情檔新增指數與個股漲跌欄位。


## V1.5.4 修正
- 修正舊版將 unresolved 代號（例如 `00713 -> 00713`）保存 7 天，導致完整 `security-master.json` 已有中文名稱仍不會重新查詢的問題。
- 只有 `name !== symbol` 且來源不是 `unresolved` 的證券名稱快取才可直接命中。
- 發現舊的無效快取會自動刪除並立即重新讀取 GitHub Pages 證券主檔。


## V1.5.4：已實現損益與個股總覽

- 個股詳情頁改為總覽／交易／股息／已實現四頁籤。
- 新增個股「已實現損益」與「總報酬金額」。
- 首頁「今年已實現損益」可點擊，進入年度明細頁。
- 已實現損益改採 FIFO（先進先出），買進手續費納入成本、賣出手續費與證交稅自賣出收入扣除。
- 支援真正的 0 成本配股，不會因成本為 0 被判定成成本待補。
- 每筆賣出可展開檢視對應 FIFO 買進批次。
- 年度明細提供獲利／虧損筆數、勝率、最大獲利、最大虧損，以及依標的彙整。
- Data Version 維持 V13；所有損益皆由既有 investment ledger 衍生計算，不存死數字。
