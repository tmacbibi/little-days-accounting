# 報帳助手 PWA V2

這是從既有 AppSheet 報帳系統整理出的 PWA V2 第一版骨架，目標是讓手機端日常操作更直覺，同時保留既有 AppSheet 作為備援。

## 已完成（V2.0 alpha）
- PWA，可加入手機主畫面、離線快取
- IndexedDB 本機資料庫（不依賴 localStorage）
- 首頁 Dashboard：待請款筆數與金額
- 手機快速新增報帳
- 里程補助 8 元/km
- 停車費、定額膳費（120/180/180）
- 國內出差 / 一般請款 / 無外來憑證自動判斷
- 一般請款最多 4 列防呆
- 待請款多選與「建立本週請款批次」
- 每月電話費補助 600 元快速建立
- JSON 備份 / 還原
- 版本號與 Service Worker 更新提示

## 尚未接上的正式功能
1. Google Sheet 現有資料同步 / migration
2. 既有 Word 範本 PDF 產製 API
3. 一頁 3 張一般請款單批次排版
4. Google Drive 儲存
5. 已產表 / 已請款批次狀態
6. Supabase 正式資料庫（等 PWA 穩定後再切）
7. 語音 / 自然語言輸入

## 直接試用
這是一個「不用 build」的靜態 PWA。

最簡單部署方式：把整個資料夾內容上傳到 GitHub repository，開啟 GitHub Pages（Deploy from branch / root）。

注意：直接雙擊 `index.html` 可能因瀏覽器 ES module / service worker 安全限制而無法完整使用；建議透過 GitHub Pages 或本機 HTTP server 開啟。

## 資料安全
目前所有報帳資料存放在瀏覽器的 IndexedDB。更新前建議從「設定 → 立即備份」匯出 JSON。正式版會加入 Google Sheet / Supabase 雲端同步。