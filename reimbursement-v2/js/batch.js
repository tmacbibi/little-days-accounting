import { db } from './db.js';
import { APP_VERSION, money } from './rules.js';
import { esc, eventCard, emptyState } from './ui.js';

const root = document.querySelector('#batchApp');

function slipPreview(e, i) {
  const rows = (e.computed?.generalRows || []).slice(0, 4);
  return `<div class="mini-slip">
    <div class="mini-slip-head"><b>請 款 單</b><span>#${i + 1}</span></div>
    <div class="mini-slip-meta"><span>${esc(e.date)}</span><span>${esc(e.projectCode || '—')}</span></div>
    <div class="mini-slip-lines">
      ${rows.map(r => `<div><span>${esc(r.summary)}</span><b>${money(r.amount)}</b></div>`).join('')}
    </div>
    <div class="mini-slip-total"><span>總計</span><strong>${money(e.computed?.generalAmount || 0)}</strong></div>
  </div>`;
}

async function load() {
  const batches = (await db.all('batches')).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const events = await db.all('events');
  const batch = batches[0];

  if (!batch) {
    root.innerHTML = `<div class="app-shell"><header class="topbar"><div><h1>請款批次預覽</h1><small>V${APP_VERSION}</small></div></header><main class="section">${emptyState('尚無請款批次','請先回到待請款頁面勾選事件。')}<a class="primary full link-button" href="./">回報帳助手</a></main></div>`;
    return;
  }

  const rows = (batch.eventIds || []).map(id => events.find(e => e.id === id)).filter(Boolean);
  const total = rows.reduce((s,e) => s + (e.computed?.claimTotal || 0), 0);
  const general = rows.filter(e => (e.computed?.generalAmount || 0) > 0);
  const travel = rows.filter(e => e.eventType === '國內出差');
  const noReceipt = rows.filter(e => (e.computed?.mileage || 0) > 0);
  const pages = Math.ceil(general.length / 3);
  const preview = general.slice(0, 3);

  root.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div><h1>請款批次預覽</h1><small>V${APP_VERSION}</small></div>
        <a class="icon-btn icon-link" href="./" aria-label="回首頁">×</a>
      </header>

      <main>
        <section class="batch-hero">
          <a class="back-link" href="./">‹ 回待請款</a>
          <span class="eyebrow">本次請款批次</span>
          <h2>${esc(batch.name)}</h2>
          <strong>${money(total)}</strong>
          <p>${rows.length} 筆事件・${esc(batch.status || '準備中')}</p>
        </section>

        <section class="section">
          <div class="section-head"><h2>本批將產生</h2><span class="muted">自動分類</span></div>
          <div class="form-summary-grid">
            <div class="form-summary"><b>一般請款單</b><strong>${general.length}</strong><small>${general.length ? `約 ${pages} 張 A4（每頁 3 小單）` : '不需產生'}</small></div>
            <div class="form-summary"><b>國內出差</b><strong>${travel.length}</strong><small>${travel.length ? '依事件各自產表' : '不需產生'}</small></div>
            <div class="form-summary"><b>無外來憑證</b><strong>${noReceipt.length}</strong><small>${noReceipt.length ? '只列里程補助' : '不需產生'}</small></div>
          </div>
        </section>

        ${general.length ? `<section class="section">
          <div class="section-head"><h2>一般請款單 A4 預覽</h2><span class="muted">一頁 3 小單</span></div>
          <div class="paper-preview">
            ${preview.map(slipPreview).join('')}
            ${Array.from({length: Math.max(0, 3 - preview.length)}, () => '<div class="mini-slip placeholder-slip">空白位置</div>').join('')}
          </div>
        </section>` : ''}

        <section class="section">
          <div class="section-head"><h2>事件明細</h2><span class="muted">${rows.length} 筆</span></div>
          ${rows.map(e => `<div class="batch-event">${eventCard(e)}<div class="form-tags">${(e.computed?.requiredForms || []).map(f => `<span>${esc(f)}</span>`).join('')}</div></div>`).join('')}
        </section>

        <section class="section batch-actions">
          <button class="primary full" id="generateBatch">產生本批表單</button>
          <p class="muted center">下一階段會直接接正式 PDF 引擎與 Google Drive。</p>
        </section>
      </main>
    </div>`;

  // PDF / Google Drive 串接完成後再啟用此按鈕，避免讓使用者誤以為已成功上傳。
}

load();