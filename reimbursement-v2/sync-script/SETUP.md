# 報帳助手：跨裝置同步（最小權限）

這一套同步和 PDF 的 Google Drive 上傳分開。

## 權限原則
這支 Apps Script 必須從「報帳資料庫」Google Sheet 裡的「擴充功能 → Apps Script」建立，並只使用：

`https://www.googleapis.com/auth/spreadsheets.currentonly`

它只能操作這一份試算表，不需要 Google Drive 全碟讀寫權限，也沒有刪除 Drive 檔案的程式。

## 一次性設定
1. 在 Google Drive 建立資料夾：`報帳申請管理系統`
2. 在裡面建立子資料夾：`Data`
3. 在 Data 裡建立 Google Sheet：`報帳資料庫`
4. 從該 Sheet 開啟「擴充功能 → Apps Script」
5. 把本資料夾的 `Code.gs` 貼到專案
6. 專案設定中顯示 manifest 檔，把 `appsscript.json` 內容貼入
7. 修改 `CONFIG.SECRET` 成你自己的長密碼
8. 執行一次 `setup()`，建立 Events / Batches / Meta 工作表
9. 部署 → 新增部署 → Web App
   - 執行身分：我
   - 誰可以存取：任何人
10. 把 Web App URL 與 Sync Key 填到 PWA 設定頁的「跨裝置資料同步」

完成後，手機與電腦會以同一份專用 Google Sheet 為雲端資料庫。
