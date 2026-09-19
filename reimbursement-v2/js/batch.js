import { db } from './db.js';
import { APP_VERSION, money } from './rules.js';
import { esc, eventCard, emptyState } from './ui.js';
import { generateBatchPdfs, openPdf, downloadBlob } from './pdf.js';
import { getClientId, connectDrive, uploadBatchPdfs } from './drive.js';

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
          <button class="primary full" id="generateBatch">產生正式 PDF 並上傳 Google Drive</button>
          <p class="muted center">會依公司正式格式產製，一張 A4 可放上／中／下 3 筆；超過 3 筆自動換頁。</p>
          <div id="generateStatus" class="generate-status"></div>
          <div id="generatedActions" class="generated-actions hidden"></div>
        </section>
      </main>
    </div>`;

  let generatedFiles = [];
  const btn = document.querySelector('#generateBatch');
  const status = document.querySelector('#generateStatus');
  const actions = document.querySelector('#generatedActions');

  function showFiles(files, uploaded=false) {
    const combined = files.find(f => f.kind === '整批');
    actions.classList.remove('hidden');
    actions.innerHTML = `
      <div class="result-card">
        <strong>${uploaded ? 'PDF 已產生並上傳 Google Drive' : 'PDF 已產生'}</strong>
        <small>${files.length} 個 PDF 檔</small>
        ${combined ? '<button class="primary full" id="openCombined">開啟整批 PDF／列印</button>' : ''}
        <div class="file-actions">
          ${files.map((f,i)=>`<button class="ghost file-download" data-file="${i}">下載 ${esc(f.name)}</button>`).join('')}
        </div>
      </div>`;
    document.querySelector('#openCombined')?.addEventListener('click',()=>openPdf(combined.blob));
    document.querySelectorAll('.file-download').forEach(b=>b.onclick=()=>downloadBlob(files[Number(b.dataset.file)].blob,files[Number(b.dataset.file)].name));
  }

  btn?.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = '正在產製公司表單…';
    status.textContent = '正在把本批資料排入正式表單（每頁 3 筆）';
    try {
      if (getClientId()) {
        status.textContent = '正在連接 Google Drive…';
        await connectDrive();
      }
      btn.textContent = '正在產製公司表單…';
      status.textContent = '正在把本批資料排入正式表單（每頁 3 筆）';
      generatedFiles = await generateBatchPdfs(rows, batch.name);
      if (!generatedFiles.length) throw new Error('本批沒有可產生的表單');
      batch.status = '已產生PDF';
      batch.generatedAt = new Date().toISOString();
      await db.put('batches', batch);
      showFiles(generatedFiles, false);

      if (!getClientId()) {
        status.innerHTML = 'PDF 已完成，但 Google Drive 尚差一次 OAuth Client ID 設定。<a href="./?settings=drive">前往設定</a>';
        btn.textContent = 'PDF 已產生（待 Drive 設定）';
        return;
      }

      btn.textContent = '正在上傳 Google Drive…';
      status.textContent = '正在建立月份資料夾並上傳 PDF';
      const batchDate = rows[0]?.date ? new Date(rows[0].date + 'T00:00:00') : new Date();
      const uploaded = await uploadBatchPdfs(generatedFiles, batchDate);
      batch.status = '已產表並上傳';
      batch.driveFiles = uploaded.map(x=>({id:x.id,name:x.name,webViewLink:x.webViewLink||''}));
      batch.uploadedAt = new Date().toISOString();
      await db.put('batches', batch);
      for (const e of rows) {
        e.status = '已產生表單';
        e.updatedAt = new Date().toISOString();
        await db.put('events', e);
      }
      document.querySelector('.batch-hero p').textContent = `${rows.length} 筆事件・已產表並上傳`;
      status.textContent = '完成：正式 PDF 已存入 Google Drive「報帳系統／年／月／請款PDF」與「整批匯出」。';
      showFiles(generatedFiles, true);
      btn.textContent = '重新產生並覆核';
      btn.disabled = false;
    } catch (err) {
      console.error(err);
      status.textContent = '失敗：' + (err?.message || err);
      btn.textContent = '重新嘗試產生 PDF';
      btn.disabled = false;
    }
  });
}

load();