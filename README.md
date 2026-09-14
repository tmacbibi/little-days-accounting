# 小日子記帳 V1.4.11

V1.4.11 是「證券主檔／行情同源修正版」。資料結構仍為 V13，不需重新匯入既有記帳／投資資料。

## 為什麼要出這版
V1.4.10 的兩個新功能在 iPhone PWA 上可能同時失敗：
1. 中文名稱查詢由手機直接抓 TWSE／TPEx 全市場 OpenAPI，容易遇到 CORS、逾時或大型 payload 問題。
2. 更新股價也由手機直接抓官方全市場資料；同樣容易失敗。

V1.4.11 改成由既有 Cloudflare Pages Function `functions/api/quotes.js` 做同源中介。手機只向自己的網站 `/api/quotes` 取少量結果。

## 1. 輸入代號自動抓中文名稱
- 先查手機本機 7 天快取。
- 沒有快取時呼叫 `/api/quotes?mode=master&symbol=...`。
- Cloudflare server 端再查 TWSE / TPEx 官方全市場資料，只把該一檔的名稱、市場、類型與最新收盤回給手機。
- Proxy 暫時不可用時才退回手機直連官方來源。
- 查不到時不亂猜中文名稱。

## 2. 更新股價
- 一次把目前持股代號傳給 `/api/quotes?mode=snapshot&symbols=...`。
- Cloudflare server 端最多各抓一次 TWSE / TPEx 官方快照，再只回傳使用者持有的幾檔。
- 若官方快照日期就是今天，存成正式 `close`。
- 若今天尚未收盤，正式收盤仍保留最近交易日；盤中價再用 MIS best-effort 補充。

## 3. 硬快取規則
- `symbol + marketDate + priceType=close` 唯一。
- 只要某檔已存在今天正式收盤價，再按更新時該檔**完全不再發行情 API 請求**。
- 全部持股今天正式收盤都已存在時，按鈕直接顯示「今日收盤價已更新，不重複查詢」。
- App 關閉重開後仍使用本機持久快取。

## 4. 部署注意：這次 `quotes.js` 必須更新
V1.4.11 的中文名稱和正式收盤功能會優先使用新版 `functions/api/quotes.js`。
因此除了根目錄 `app.js / index.html / styles.css / sw.js ...` 外，請務必覆蓋：

`functions/api/quotes.js`

手機操作最簡單的方法：進 GitHub repository 的 `functions` → `api`，再選 Upload files，只上傳新的 `quotes.js` 一個檔案即可；不需要重新建立資料夾，也不需要貼程式碼。
