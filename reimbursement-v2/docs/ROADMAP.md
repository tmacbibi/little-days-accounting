# 報帳助手 V2 Roadmap

## Phase 1 — PWA V2.0（目前）
- 快速新增
- 即時計算
- 待請款多選
- 批次建立
- 歷史紀錄
- 本機備份

## Phase 2 — PWA V2.1
- 建立 `GoogleSheetAdapter`，把既有 AppSheet Sheet 作為雲端來源
- 建立 PDF generation API
- 一般請款：每事件一張小單、3 張小單 / A4 頁
- 國內出差 / 無外來憑證批次輸出
- 批次狀態：準備中 → 已產表 → 已請款
- PDF 手機預覽與整批下載

## Phase 3 — PWA V2.2
- 自然語言 / 語音輸入
- 固定週期費用自動建立（電話費等）
- 依歷史資料建議專案代號 / 事件類型
- 表單缺漏檢查與提醒

## Phase 4 — 正式後端
- Supabase / PostgreSQL
- 使用者登入與裝置同步
- 稽核記錄 / 版本 migration
- AppSheet 保留唯讀備援一段時間後退役