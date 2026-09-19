import { db, uid } from './db.js';
import { APP_VERSION, EVENT_TYPES, TRANSPORTS, EXPENSE_TYPES, calculateEvent, money } from './rules.js';
import { html, esc, eventCard, emptyState } from './ui.js';
import { exportBackup, importBackup } from './backup.js';
import { getBridgeUrl, setBridgeUrl, getBridgeKey, setBridgeKey, testBridge } from './drive.js';

const app = document.querySelector('#app');
const initialPage = new URLSearchParams(location.search).has('settings') ? 'settings' : 'home';
const state = { page: initialPage, events: [], batches: [], editing: null, selected: new Set() };

async function refresh() {
  state.events = (await db.all('events')).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  state.batches = (await db.all('batches')).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  render();
}

function nav() {
  return html`<nav class="bottom-nav">
    ${[['home','首頁','⌂'],['pending','待請款','☷'],['paid','已請款','✓'],['history','歷史','◷']].map(([key,label,icon]) =>
      `<button data-nav="${key}" class="${state.page===key?'active':''}"><span>${icon}</span><small>${label}</small></button>`).join('')}
  </nav>`;
}

function shell(content, title='報帳助手') {
  return html`<div class="app-shell"><header class="topbar"><div><h1>${title}</h1><small>V${APP_VERSION}</small></div><button class="icon-btn" data-nav="settings" aria-label="設定">⚙︎</button></header><main>${content}</main>${nav()}</div>`;
}

function homePage() {
  const pending = state.events.filter(e => e.status === '待請款');
  const pendingTotal = pending.reduce((s,e)=>s+(e.computed?.claimTotal||0),0);
  const claimed = state.events.filter(e => e.status === '已請款' || e.status === '已產生表單').length;
  const recent = state.events.slice(0,4);
  return shell(html`
    <section class="hero-card"><div><span class="eyebrow">本次待請款</span><strong class="hero-money">${money(pendingTotal)}</strong><small>${pending.length} 筆事件・${claimed} 筆已請款</small></div><button class="primary" data-nav="new">＋ 新增報帳</button></section>
    <section class="quick-grid">
      <button class="quick" data-nav="new"><b>＋</b><span>快速新增</span><small>30 秒完成一筆</small></button>
      <button class="quick" data-nav="pending"><b>☷</b><span>本次請款</span><small>多選後建立批次</small></button>
      <button class="quick" data-action="phone"><b>☎</b><span>電話補助</span><small>快速建立 600 元</small></button>
      <button class="quick" data-nav="settings"><b>↥</b><span>備份</span><small>匯出 / 匯入資料</small></button>
    </section>
    <section class="section"><div class="section-head"><h2>最近事件</h2><button data-nav="history">全部</button></div>${recent.length ? recent.map(eventCard).join('') : emptyState('尚無報帳事件','先新增第一筆，系統會自動計算需要的表單。')}</section>
  `,'報帳助手');
}

function splitLegacyRoute(route='') {
  const parts = String(route || '').split(/[－—–-]/).map(s => s.trim()).filter(Boolean);
  return { startLocation: parts[0] || '', endLocation: parts.slice(1).join('－') || '' };
}

function newPage() {
  const e = state.editing || { date:new Date().toISOString().slice(0,10), eventType:'雙北內開會或洽公', startLocation:'', endLocation:'', transport:'無交通費', highSpeedRailFare:0, taxiFare:0, mealMode:'無餐費', actualMealAmount:0, expenses:[], status:'待請款' };
  const legacyRoute = splitLegacyRoute(e.route);
  const startLocation = e.startLocation ?? legacyRoute.startLocation;
  const endLocation = e.endLocation ?? legacyRoute.endLocation;
  const c = calculateEvent(e);
  const expenseRows = (e.expenses||[]).map((x,i)=>html`<div class="expense-row"><select data-expense-type="${i}">${EXPENSE_TYPES.map(v=>`<option ${x.type===v?'selected':''}>${v}</option>`).join('')}</select><input data-expense-amount="${i}" inputmode="numeric" type="number" value="${esc(x.amount||'')}" placeholder="金額"><input data-expense-note="${i}" value="${esc(x.note||'')}" placeholder="備註"><button data-remove-expense="${i}">×</button></div>`).join('');
  return shell(html`
    <form id="eventForm" class="form-page">
      <div class="form-section"><h2>基本資料</h2>
        <label>日期<input name="date" type="date" value="${esc(e.date)}"></label>
        <label>事件名稱<input name="name" value="${esc(e.name||'')}" placeholder="例：宜蘭出差、工作會議"></label>
        <label>專案代號<input name="projectCode" value="${esc(e.projectCode||'')}" placeholder="例：CD77"></label>
        <label>事件類型<select name="eventType">${EVENT_TYPES.map(v=>`<option ${e.eventType===v?'selected':''}>${v}</option>`).join('')}</select></label>
        <div class="two-col"><label>起點<input name="startLocation" value="${esc(startLocation)}" placeholder="例：蘆洲"></label><label>迄點<input name="endLocation" value="${esc(endLocation)}" placeholder="例：宜蘭"></label></div>
      </div>
      <div class="form-section"><h2>交通</h2>
        <label>交通方式<select name="transport">${TRANSPORTS.map(v=>`<option ${e.transport===v?'selected':''}>${v}</option>`).join('')}</select></label>
        <div class="two-col self-drive ${e.transport==='自行開車'?'':'hidden'}"><label>總公里數<input name="km" type="number" inputmode="decimal" value="${esc(e.km||'')}"></label><label>停車費<input name="parking" type="number" inputmode="numeric" value="${esc(e.parking||'')}"></label></div>
        <div class="high-speed-rail ${e.transport==='高鐵'?'':'hidden'}"><label>高鐵票價<input name="highSpeedRailFare" type="number" inputmode="numeric" min="0" value="${esc(e.highSpeedRailFare||'')}" placeholder="請輸入實際票價"></label></div>
        <div class="taxi-fare ${e.transport==='計程車'?'':'hidden'}"><label>計程車費<input name="taxiFare" type="number" inputmode="numeric" min="0" value="${esc(e.taxiFare||'')}" placeholder="請輸入實際車資"></label></div>
      </div>
      <div class="form-section travel-only ${e.eventType==='國內出差'?'':'hidden'}"><h2>出差膳費</h2>
        <div class="segmented">${['定額膳費','實際餐費','無餐費'].map(v=>`<label><input type="radio" name="mealMode" value="${v}" ${e.mealMode===v?'checked':''}><span>${v}</span></label>`).join('')}</div>
        <div class="meal-checks ${e.mealMode==='定額膳費'?'':'hidden'}"><label><input type="checkbox" name="breakfast" ${e.breakfast?'checked':''}>早餐 120</label><label><input type="checkbox" name="lunch" ${e.lunch?'checked':''}>午餐 180</label><label><input type="checkbox" name="dinner" ${e.dinner?'checked':''}>晚餐 180</label></div>
        <div class="actual-meal ${e.mealMode==='實際餐費'?'':'hidden'}"><label>實際餐費金額<input name="actualMealAmount" type="number" inputmode="numeric" min="0" value="${esc(e.actualMealAmount||'')}" placeholder="請輸入實際餐費"></label></div>
      </div>
      <div class="form-section"><div class="section-head"><h2>其他費用</h2><button type="button" class="ghost" data-add-expense>＋新增</button></div>${expenseRows || '<p class="muted">沒有其他費用</p>'}</div>
      <div class="preview-card"><span>預計請款</span><strong>${money(c.claimTotal)}</strong><div class="form-tags">${c.requiredForms.map(f=>`<span>${f}</span>`).join('') || '<span>尚未產生表單</span>'}</div>${c.overGeneralRows?'<p class="warning">一般請款超過 4 列，請拆分事件。</p>':''}</div>
      <button class="primary full" type="submit">${state.editing?.id ? '儲存修改' : '儲存為待請款'}</button>
    </form>
  `,state.editing?.id ? '編輯報帳' : '新增報帳');
}

function pendingPage() {
  const list = state.events.filter(e=>e.status==='待請款');
  const selectedRows = list.filter(e=>state.selected.has(e.id));
  const total = selectedRows.reduce((s,e)=>s+(e.computed?.claimTotal||0),0);
  return shell(html`
    <section class="section"><div class="section-head"><div><h2>待請款</h2><p class="muted">長按概念改為直接勾選，多筆可建批次</p></div><button class="ghost" data-select-all>${state.selected.size?'取消選取':'全選'}</button></div>
    ${list.length ? list.map(e=>`<div class="select-card"><input type="checkbox" data-select="${e.id}" ${state.selected.has(e.id)?'checked':''}><div>${eventCard(e)}</div></div>`).join('') : emptyState('目前沒有待請款','新增事件後會出現在這裡。')}</section>
    ${state.selected.size?`<div class="batch-bar"><div><small>已選 ${state.selected.size} 筆</small><strong>${money(total)}</strong></div><button class="primary" data-create-batch>建立本次請款</button></div>`:''}
  `,'本次請款');
}

function paidPage() {
  const list = state.events.filter(e=>e.status==='已請款' || e.status==='已產生表單');
  return shell(html`<section class="section"><div class="section-head"><div><h2>已請款</h2><p class="muted">已產製表單／已完成請款的事件</p></div><span class="muted">${list.length} 筆</span></div>${list.length?list.map(eventCard).join(''):emptyState('目前沒有已請款','完成產表與上傳後會出現在這裡。')}</section>`,'已請款');
}

function historyPage() {
  const list = state.events;
  return shell(html`<section class="section"><div class="section-head"><h2>歷史紀錄</h2><span class="muted">${list.length} 筆</span></div>${list.length?list.map(eventCard).join(''):emptyState('尚無歷史紀錄','完成的請款會保留在這裡。')}</section>`,'歷史紀錄');
}

function settingsPage() {
  return shell(html`<section class="section settings-list">
    <div class="settings-card"><h2>資料安全</h2><p>資料目前儲存在本機 IndexedDB；更新 App 不會主動清空資料。</p><button class="primary" data-export>立即備份</button><label class="file-btn">恢復備份<input id="importFile" type="file" accept="application/json"></label></div>
    <div class="settings-card"><h2>Google Drive 自動歸檔</h2>
      <p>不用 Google Cloud。只要把專用 Google 帳號的 Apps Script 部署成 Web App，一次設定後即可自動把 PDF 存進 Google Drive。</p>
      <div class="file-actions">
        <a class="ghost link-button" target="_blank" rel="noopener" href="https://script.google.com/home/projects/create">① 開啟 Apps Script 建立專案</a>
        <a class="ghost link-button" target="_blank" rel="noopener" href="https://github.com/tmacbibi/little-days-accounting/blob/main/reimbursement-v2/apps-script/Code.gs">② 查看要貼上的 Code.gs</a>
      </div>
      <label>Apps Script Web App URL<input id="bridgeUrl" value="${esc(getBridgeUrl())}" placeholder="https://script.google.com/macros/s/.../exec"></label>
      <label>Bridge Key<input id="bridgeKey" value="${esc(getBridgeKey())}" placeholder="與 Apps Script CONFIG.SECRET 相同"></label>
      <button class="primary" id="saveDriveConfig">儲存並測試連線</button>
      <small class="muted">Web App 執行身分選「我」，存取權選「任何人」。Bridge Key 可避免陌生人亂塞檔案。</small>
    </div>
    <div class="settings-card"><h2>版本</h2><p>V${APP_VERSION}</p><small class="muted">正式公司表單 PDF、每頁 3 筆排版、高鐵票價、起點／迄點、Google Drive 自動歸檔。</small></div>
    <div class="settings-card"><h2>資料來源</h2><p>報帳資料仍存在本機 IndexedDB；正式 PDF 可直接列印並同步至 Google Drive。</p></div>
  `,'設定');
}

function render() {
  app.innerHTML = state.page==='home'?homePage():state.page==='new'?newPage():state.page==='pending'?pendingPage():state.page==='paid'?paidPage():state.page==='history'?historyPage():settingsPage();
  bind();
}

function collectForm() {
  const f = document.querySelector('#eventForm');
  if (!f) return null;
  const fd = new FormData(f);
  return {
    ...(state.editing||{}),
    date: fd.get('date'), name: fd.get('name')?.trim(), projectCode: fd.get('projectCode')?.trim(),
    eventType: fd.get('eventType'), startLocation: fd.get('startLocation')?.trim(), endLocation: fd.get('endLocation')?.trim(),
    route: [fd.get('startLocation')?.trim(), fd.get('endLocation')?.trim()].filter(Boolean).join('－'), transport: fd.get('transport'),
    km: Number(fd.get('km')||0), parking: Number(fd.get('parking')||0), highSpeedRailFare: Number(fd.get('highSpeedRailFare')||0), taxiFare: Number(fd.get('taxiFare')||0), mealMode: fd.get('mealMode')||'無餐費', actualMealAmount: Number(fd.get('actualMealAmount')||0),
    breakfast: fd.get('breakfast')==='on', lunch: fd.get('lunch')==='on', dinner: fd.get('dinner')==='on',
    expenses: state.editing?.expenses || [], status: state.editing?.status || '待請款'
  };
}

function liveRecompute() {
  const draft = collectForm(); if (!draft) return;
  state.editing = draft; render();
}

function bind() {
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{ state.page=b.dataset.nav; if(state.page!=='new') state.editing=null; render(); });
  document.querySelector('[data-action="phone"]')?.addEventListener('click', async()=>{
    const now = new Date(); const month = now.getMonth()+1;
    const row = { id:uid('evt'), date:now.toISOString().slice(0,10), name:`${month}月電話費補助`, projectCode:'', eventType:'通話費補助', route:'', transport:'無交通費', expenses:[{type:'通話費補助',amount:600,note:''}], status:'待請款', createdAt:new Date().toISOString() };
    row.computed = calculateEvent(row); await db.put('events',row); await refresh();
  });
  const form = document.querySelector('#eventForm');
  form?.addEventListener('submit', async ev=>{
    ev.preventDefault(); const row=collectForm(); if(!row.name){alert('請輸入事件名稱');return;} row.id=row.id||uid('evt'); row.createdAt=row.createdAt||new Date().toISOString(); row.updatedAt=new Date().toISOString(); row.computed=calculateEvent(row); if(row.computed.overGeneralRows){alert('一般請款超過4列，請先拆分事件。');return;} await db.put('events',row); state.editing=null; state.page='home'; await refresh();
  });
  form?.querySelectorAll('input,select').forEach(el=>{ if(el.closest('.expense-row'))return; el.onchange=()=>{ const draft=collectForm(); state.editing=draft; render(); }; });
  document.querySelector('[data-add-expense]')?.addEventListener('click',()=>{ const draft=collectForm(); draft.expenses=[...(draft.expenses||[]),{type:'會議飲料',amount:'',note:''}]; state.editing=draft; render(); });
  document.querySelectorAll('[data-remove-expense]').forEach(btn=>btn.onclick=()=>{ const draft=collectForm(); draft.expenses.splice(Number(btn.dataset.removeExpense),1); state.editing=draft; render(); });
  document.querySelectorAll('[data-expense-type]').forEach(el=>el.onchange=()=>{ const i=Number(el.dataset.expenseType); const d=collectForm(); d.expenses[i]={...(d.expenses[i]||{}),type:el.value}; state.editing=d; render(); });
  document.querySelectorAll('[data-expense-amount]').forEach(el=>el.onchange=()=>{ const i=Number(el.dataset.expenseAmount); const d=collectForm(); d.expenses[i]={...(d.expenses[i]||{}),amount:Number(el.value||0)}; state.editing=d; render(); });
  document.querySelectorAll('[data-expense-note]').forEach(el=>el.onchange=()=>{ const i=Number(el.dataset.expenseNote); const d=collectForm(); d.expenses[i]={...(d.expenses[i]||{}),note:el.value}; state.editing=d; render(); });
  document.querySelectorAll('.event-card[data-id]').forEach(card=>{
    card.onclick=ev=>{
      if(ev.target.closest('input,button,a,select,label')) return;
      ev.stopPropagation();
      const row=state.events.find(e=>e.id===card.dataset.id);
      if(!row) return;
      state.editing=structuredClone ? structuredClone(row) : JSON.parse(JSON.stringify(row));
      state.page='new';
      render();
    };
  });
  document.querySelectorAll('[data-select]').forEach(el=>{
    el.onclick=ev=>ev.stopPropagation();
    el.onchange=()=>{ el.checked?state.selected.add(el.dataset.select):state.selected.delete(el.dataset.select); render(); };
  });
  document.querySelector('[data-select-all]')?.addEventListener('click',()=>{ const list=state.events.filter(e=>e.status==='待請款'); if(state.selected.size)state.selected.clear(); else list.forEach(e=>state.selected.add(e.id)); render(); });
  document.querySelector('[data-create-batch]')?.addEventListener('click',async()=>{ const ids=[...state.selected]; if(!ids.length)return; const now=new Date(); const batch={id:uid('batch'),name:`${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} 本次請款`,createdAt:now.toISOString(),status:'準備中',eventIds:ids}; await db.put('batches',batch); for(const id of ids){const e=await db.get('events',id);e.batchId=batch.id;await db.put('events',e);} state.selected.clear(); await refresh(); location.href='./batch.html'; });
  document.querySelector('[data-export]')?.addEventListener('click',exportBackup);
  document.querySelector('#saveDriveConfig')?.addEventListener('click', async()=>{
    const url=document.querySelector('#bridgeUrl')?.value?.trim()||'';
    const key=document.querySelector('#bridgeKey')?.value?.trim()||'';
    if(!url||!key){alert('請填 Apps Script Web App URL 與 Bridge Key');return;}
    setBridgeUrl(url);setBridgeKey(key);
    try{await testBridge();alert('Google Drive Bridge 連線成功。之後產製表單會自動上傳。');}
    catch(err){alert('連線失敗：'+(err?.message||err));}
  });
  document.querySelector('#importFile')?.addEventListener('change',async e=>{ if(!e.target.files[0])return; if(!confirm('恢復備份會覆蓋目前資料，確定嗎？'))return; try{await importBackup(e.target.files[0]);alert('恢復完成');await refresh();}catch(err){alert(`恢復失敗：${err.message}`);} });
}

async function seed() {
  const existing = await db.all('events'); if(existing.length) return;
  const row={id:uid('evt'),date:new Date().toISOString().slice(0,10),name:'示範：工作會議',projectCode:'CD77',eventType:'雙北內開會或洽公',startLocation:'蘆洲',endLocation:'台北',route:'蘆洲－台北',transport:'自行開車',km:80,parking:120,expenses:[{type:'會議飲料',amount:180,note:''}],status:'待請款',createdAt:new Date().toISOString()}; row.computed=calculateEvent(row); await db.put('events',row);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{ const worker=reg.installing; worker?.addEventListener('statechange',()=>{ if(worker.state==='installed'&&navigator.serviceWorker.controller) document.querySelector('#updateBanner')?.classList.remove('hidden'); }); });
  });
  document.querySelector('#reloadApp')?.addEventListener('click',()=>location.reload());
}

await seed(); await refresh();
