'use strict';

const $ = id => document.getElementById(id);
const APP_VERSION = '1.3.5';
const DATA_VERSION = 9;
const VAULT_KEY = 'little_days_bookkeeping_vault_v2';
const AUTH_KEY = 'little_days_bookkeeping_auth_v2';
const LEGACY_TXN_KEY = 'little_days_bookkeeping_txns_v1';
const LEGACY_BUDGET_KEY = 'little_days_bookkeeping_budget_v1';
const LEGACY_SETTINGS_KEY = 'little_days_bookkeeping_settings_v1';
const DB_NAME = 'little_days_bookkeeping_secure_v1';
const DB_STORE = 'keys';
const DEVICE_KEY_ID = 'device-aes-key';

const HISTORICAL_SEED_VERSION = '';
const HISTORICAL_SEED_TXNS = [];
const HISTORICAL_SEED_RECURRING = [];

const HISTORICAL_CATEGORY_SPLIT_VERSION = '2026-v2';
const HISTORICAL_CATEGORY_SPLITS = {
  "2026-01":[{categoryId:"food",subcategory:"家庭餐飲",amount:6318},{categoryId:"food",subcategory:"上班餐飲",amount:4199},{categoryId:"home",subcategory:"生活雜支",amount:2742},{categoryId:"shopping",subcategory:"個人購物",amount:2659},{categoryId:"leisure",subcategory:"旅遊",amount:1985},{categoryId:"other",subcategory:"其他",amount:1195},{categoryId:"food",subcategory:"個人餐飲",amount:989},{categoryId:"shopping",subcategory:"網購",amount:749},{categoryId:"transport",subcategory:"充電／加油",amount:665},{categoryId:"leisure",subcategory:"娛樂",amount:516},{categoryId:"leisure",subcategory:"訂閱服務",amount:380},{categoryId:"transport",subcategory:"停車",amount:215},{categoryId:"social",subcategory:"其他交際",amount:123},{categoryId:"transport",subcategory:"其他交通",amount:95},{categoryId:"transport",subcategory:"計程車",amount:62},{categoryId:"social",subcategory:"朋友聚餐／請客",amount:58},{categoryId:"health",subcategory:"藥品",amount:23}],
  "2026-02":[{categoryId:"home",subcategory:"生活雜支",amount:6221},{categoryId:"transport",subcategory:"充電／加油",amount:5000},{categoryId:"leisure",subcategory:"娛樂",amount:4280},{categoryId:"shopping",subcategory:"網購",amount:4160},{categoryId:"food",subcategory:"家庭餐飲",amount:3873},{categoryId:"food",subcategory:"上班餐飲",amount:2161},{categoryId:"other",subcategory:"其他",amount:1433},{categoryId:"shopping",subcategory:"個人購物",amount:80},{categoryId:"leisure",subcategory:"訂閱服務",amount:30}],
  "2026-03":[{categoryId:"food",subcategory:"家庭餐飲",amount:5590},{categoryId:"food",subcategory:"上班餐飲",amount:3307},{categoryId:"shopping",subcategory:"網購",amount:970},{categoryId:"home",subcategory:"生活雜支",amount:921},{categoryId:"food",subcategory:"個人餐飲",amount:762},{categoryId:"leisure",subcategory:"訂閱服務",amount:495},{categoryId:"social",subcategory:"其他交際",amount:480},{categoryId:"other",subcategory:"其他",amount:165},{categoryId:"transport",subcategory:"停車",amount:135}],
  "2026-04":[{categoryId:"food",subcategory:"上班餐飲",amount:15538},{categoryId:"home",subcategory:"生活雜支",amount:8001},{categoryId:"food",subcategory:"家庭餐飲",amount:5520},{categoryId:"food",subcategory:"個人餐飲",amount:1563},{categoryId:"shopping",subcategory:"個人購物",amount:775},{categoryId:"leisure",subcategory:"訂閱服務",amount:691},{categoryId:"transport",subcategory:"停車",amount:500},{categoryId:"social",subcategory:"朋友聚餐／請客",amount:290},{categoryId:"other",subcategory:"其他",amount:102},{categoryId:"transport",subcategory:"充電／加油",amount:100}],
  "2026-05":[{categoryId:"shopping",subcategory:"個人購物",amount:19883},{categoryId:"home",subcategory:"生活雜支",amount:9891},{categoryId:"food",subcategory:"家庭餐飲",amount:7072},{categoryId:"food",subcategory:"上班餐飲",amount:3923},{categoryId:"other",subcategory:"其他",amount:2763},{categoryId:"transport",subcategory:"計程車",amount:857},{categoryId:"transport",subcategory:"停車",amount:703},{categoryId:"leisure",subcategory:"訂閱服務",amount:183},{categoryId:"food",subcategory:"個人餐飲",amount:155}],
  "2026-06":[{categoryId:"food",subcategory:"家庭餐飲",amount:10708},{categoryId:"shopping",subcategory:"個人購物",amount:6199},{categoryId:"food",subcategory:"上班餐飲",amount:4464},{categoryId:"other",subcategory:"其他",amount:1149},{categoryId:"home",subcategory:"生活雜支",amount:903},{categoryId:"leisure",subcategory:"訂閱服務",amount:730},{categoryId:"food",subcategory:"個人餐飲",amount:483},{categoryId:"transport",subcategory:"停車",amount:305},{categoryId:"social",subcategory:"朋友聚餐／請客",amount:225},{categoryId:"transport",subcategory:"充電／加油",amount:191},{categoryId:"health",subcategory:"藥品",amount:180}],
  "2026-07":[{categoryId:"food",subcategory:"家庭餐飲",amount:19355},{categoryId:"food",subcategory:"上班餐飲",amount:5292},{categoryId:"food",subcategory:"個人餐飲",amount:3332},{categoryId:"shopping",subcategory:"個人購物",amount:2782},{categoryId:"leisure",subcategory:"旅遊",amount:2337},{categoryId:"leisure",subcategory:"訂閱服務",amount:730},{categoryId:"other",subcategory:"其他",amount:684},{categoryId:"home",subcategory:"生活雜支",amount:652},{categoryId:"transport",subcategory:"停車",amount:451},{categoryId:"transport",subcategory:"其他交通",amount:400},{categoryId:"transport",subcategory:"充電／加油",amount:306}],
  "2026-08":[{categoryId:"leisure",subcategory:"旅遊",amount:12114},{categoryId:"other",subcategory:"其他",amount:3835},{categoryId:"food",subcategory:"個人餐飲",amount:1807},{categoryId:"food",subcategory:"家庭餐飲",amount:1620},{categoryId:"food",subcategory:"上班餐飲",amount:1473},{categoryId:"shopping",subcategory:"個人購物",amount:605},{categoryId:"home",subcategory:"生活雜支",amount:505},{categoryId:"transport",subcategory:"其他交通",amount:400},{categoryId:"leisure",subcategory:"訂閱服務",amount:59}]
};


const DEFAULT_CATEGORIES = [
  {id:'food',name:'餐飲',icon:'🍽️',hidden:false,subs:['上班餐飲','家庭餐飲','個人餐飲']},
  {id:'social',name:'交際應酬',icon:'🥂',hidden:false,subs:['同事聚餐','朋友聚餐／請客','其他交際']},
  {id:'transport',name:'交通',icon:'🚗',hidden:false,subs:['停車','充電／加油','大眾運輸','計程車','保養／維修','其他交通']},
  {id:'family',name:'家庭',icon:'👨‍👩‍👧‍👧',hidden:false,subs:['孝親費','教育','小孩用品','家庭活動','家庭用品','其他家庭']},
  {id:'shopping',name:'購物',icon:'🛍️',hidden:false,subs:['個人購物','服飾','3C／家電','網購','其他購物']},
  {id:'home',name:'居家生活',icon:'🏠',hidden:false,subs:['生活雜支','水電瓦斯','電話網路','家用品','其他居家']},
  {id:'leisure',name:'娛樂休閒',icon:'🎬',hidden:false,subs:['娛樂','旅遊','運動','訂閱服務','其他休閒']},
  {id:'health',name:'醫療健康',icon:'🩺',hidden:false,subs:['看診','藥品','保健','其他醫療']},
  {id:'fixed',name:'固定費用',icon:'🧾',hidden:false,subs:['保險','稅費','學費／固定支出','薪資扣除','其他固定費用']},
  {id:'other',name:'其他',icon:'📌',hidden:false,subs:['其他']}
];

const DEFAULT_QUICK_TEMPLATES = [
  {id:'qt-lunch',icon:'🍱',name:'午餐',type:'expense',amount:0,categoryId:'food',subcategory:'上班餐飲',payment:'card'},
  {id:'qt-parking',icon:'🅿️',name:'停車',type:'expense',amount:0,categoryId:'transport',subcategory:'停車',payment:'card'},
  {id:'qt-family',icon:'🍽️',name:'家庭餐飲',type:'expense',amount:0,categoryId:'food',subcategory:'家庭餐飲',payment:'card'},
  {id:'qt-social',icon:'🥂',name:'同事聚餐',type:'expense',amount:0,categoryId:'social',subcategory:'同事聚餐',payment:'card'},
  {id:'qt-phone',icon:'📱',name:'電信費',type:'expense',amount:0,categoryId:'home',subcategory:'電話網路',payment:'card'},
  {id:'qt-invest',icon:'📈',name:'定期投資',type:'investment',amount:0,investmentCategory:'股票／ETF'}
];

let txns = [];
let budgets = {};
let categories = structuredClone(DEFAULT_CATEGORIES);
let quickTemplates = structuredClone(DEFAULT_QUICK_TEMPLATES);
let settings = {};
let viewMonth = startOfMonth(new Date());
let selectedDate = dateKey(new Date());
let editingId = null;
let actionTxnId = null;
let editType = 'expense';
let selectedCategoryId = 'food';
let selectedPayment = 'card';
let availableVersion = null;
let recognition = null;
let voiceSessionActive = false;
let voiceAccumulated = '';
let voiceInterim = '';
let unlocked = false;
let vaultLoaded = false;
let authInProgress = false;
let categoryEditingId = null;
let authConfig = loadAuthConfig();
let recurring = [];
let recurringEditingId = null;
let recurringType = 'expense';
let recurringPayment = 'card';
let analysisYear = new Date().getFullYear();
let analysisMode = 'year';
let analysisMonth = new Date().getMonth();
let homeInsightMode = 'expense';
let voiceFabExpandTimer = null;
let editorMonthlyDays = [];
let recurringMonthlyDaysDraft = [];
let currentCalcExpression = '';
let calcExpression = '';
let voiceDraftItems = [];
let voiceDraftEditingIndex = null;
let quickTemplateEditingId = null;
let recurringSplitSourceId = null;
let recurringSplitEffectiveDate = '';
let insightDetailState = null;


function collapseVoiceFab(){
  const fab=$('voiceFab'); if(!fab)return;
  fab.classList.remove('expanded'); fab.setAttribute('aria-expanded','false'); fab.setAttribute('aria-label','展開語音記帳');
  clearTimeout(voiceFabExpandTimer); voiceFabExpandTimer=null;
}
function expandVoiceFab(){
  const fab=$('voiceFab'); if(!fab)return;
  fab.classList.add('expanded'); fab.setAttribute('aria-expanded','true'); fab.setAttribute('aria-label','開始語音記帳');
  clearTimeout(voiceFabExpandTimer); voiceFabExpandTimer=setTimeout(collapseVoiceFab,3500);
}
function handleVoiceFabClick(){
  const fab=$('voiceFab'); if(!fab)return;
  if(!fab.classList.contains('expanded')){ expandVoiceFab(); return; }
  collapseVoiceFab(); openVoiceSheet();
}

function clone(v){ return JSON.parse(JSON.stringify(v)); }
function show(el){ el?.classList.remove('hidden'); }
function hide(el){ el?.classList.add('hidden'); }
function toast(msg, ms=1800){ const t=$('toast'); t.textContent=msg; show(t); clearTimeout(toast._t); toast._t=setTimeout(()=>hide(t),ms); }
function money(n){ return '$' + Math.round(Number(n)||0).toLocaleString('zh-TW'); }
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function dateKey(d){ const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; }
function parseDateKey(s){ const [y,m,d]=String(s).split('-').map(Number); return new Date(y,m-1,d); }
function startOfMonth(d){ return new Date(d.getFullYear(),d.getMonth(),1); }
function addMonths(d,n){ return new Date(d.getFullYear(),d.getMonth()+n,1); }
function formatMonth(d){ return `${d.getFullYear()} 年 ${d.getMonth()+1} 月`; }
function monthKey(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function isSameMonthKey(dateStr,d=viewMonth){ return String(dateStr||'').slice(0,7)===monthKey(d); }
function sum(list){ return list.reduce((a,t)=>a+(Number(t.amount)||0),0); }
function isHistoricalSummary(t){ return !!t?.historicalSummary; }
function actualDayTxns(list){ return list.filter(t=>!isHistoricalSummary(t)); }
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function normalizePin(s){ return String(s||'').replace(/\D/g,'').slice(0,6); }
function validPin(s){ return /^\d{6}$/.test(s); }

function loadAuthConfig(){ try{return JSON.parse(localStorage.getItem(AUTH_KEY))||{};}catch{return {};} }
function saveAuthConfig(){ localStorage.setItem(AUTH_KEY,JSON.stringify(authConfig)); }
function bytesToB64(bytes){ let s=''; for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b); return btoa(s); }
function b64ToBytes(s){ const raw=atob(s); const out=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i); return out; }
function b64url(bytes){ return bytesToB64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function fromB64url(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4)s+='='; return b64ToBytes(s); }
function randomBytes(n){ const a=new Uint8Array(n); crypto.getRandomValues(a); return a; }

async function derivePinVerifier(pin,salt){
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:180000,hash:'SHA-256'},material,256);
  return bytesToB64(bits);
}
async function verifyPin(pin){
  if(!authConfig.pinSalt||!authConfig.pinHash)return false;
  const got=await derivePinVerifier(pin,b64ToBytes(authConfig.pinSalt));
  return timingSafeEqual(got,authConfig.pinHash);
}
function timingSafeEqual(a,b){ if(a.length!==b.length)return false; let x=0; for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i); return x===0; }

function openSecureDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(DB_STORE))req.result.createObjectStore(DB_STORE); };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function dbGet(key){ const db=await openSecureDb(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readonly'); const r=tx.objectStore(DB_STORE).get(key); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); tx.oncomplete=()=>db.close(); }); }
async function dbPut(key,value){ const db=await openSecureDb(); return new Promise((resolve,reject)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).put(value,key); tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>reject(tx.error); }); }
async function getDeviceKey(){
  let key=await dbGet(DEVICE_KEY_ID);
  if(!key){ key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']); await dbPut(DEVICE_KEY_ID,key); }
  return key;
}
async function encryptJson(obj){
  const key=await getDeviceKey(); const iv=randomBytes(12); const plain=new TextEncoder().encode(JSON.stringify(obj));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
  return JSON.stringify({v:2,iv:bytesToB64(iv),data:bytesToB64(cipher)});
}
async function decryptJson(payload){
  const parsed=JSON.parse(payload); const key=await getDeviceKey(); const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(parsed.iv)},key,b64ToBytes(parsed.data));
  return JSON.parse(new TextDecoder().decode(plain));
}


function sameSeedTxn(a,b){
  return a&&b&&String(a.date||'')===String(b.date||'')&&String(a.type||'')===String(b.type||'')&&
    String(a.title||'')===String(b.title||'')&&Number(a.amount||0)===Number(b.amount||0);
}
function applyHistoricalSeed(){ return false; }

function currentState(){ return {version:DATA_VERSION,txns,budgets,categories,quickTemplates,settings,recurring}; }
async function persistState(){ if(!unlocked)return; localStorage.setItem(VAULT_KEY,await encryptJson(currentState())); }
async function loadVault(){
  const payload=localStorage.getItem(VAULT_KEY);
  if(payload){
    const st=await decryptJson(payload);
    txns=Array.isArray(st.txns)?st.txns:[]; budgets=st.budgets||{}; categories=Array.isArray(st.categories)&&st.categories.length?st.categories:clone(DEFAULT_CATEGORIES); quickTemplates=Array.isArray(st.quickTemplates)&&st.quickTemplates.length?st.quickTemplates:clone(DEFAULT_QUICK_TEMPLATES); settings=st.settings||{}; recurring=Array.isArray(st.recurring)?st.recurring:(Array.isArray(st.settings?.recurring)?st.settings.recurring:[]);
  }else{
    txns=loadLegacyJson(LEGACY_TXN_KEY,[]); budgets=loadLegacyJson(LEGACY_BUDGET_KEY,{}); settings=loadLegacyJson(LEGACY_SETTINGS_KEY,{}); categories=clone(DEFAULT_CATEGORIES); quickTemplates=clone(DEFAULT_QUICK_TEMPLATES); recurring=Array.isArray(settings.recurring)?settings.recurring:[];
  }
  normalizeData(); applyHistoricalSeed(); normalizeData(); migrateHistoricalCategorySummaries(); normalizeData(); vaultLoaded=true;
  await processRecurringDue(false);
  await persistState();
  localStorage.removeItem(LEGACY_TXN_KEY); localStorage.removeItem(LEGACY_BUDGET_KEY); localStorage.removeItem(LEGACY_SETTINGS_KEY);
}
function loadLegacyJson(key,fallback){ try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;} }
function normalizeData(){
  categories.forEach(c=>{ if(typeof c.favorite!=='boolean')c.favorite=['food','social','transport'].includes(c.id); if(!Array.isArray(c.subs)||!c.subs.length)c.subs=['其他']; });
  if(!Array.isArray(quickTemplates)||!quickTemplates.length)quickTemplates=clone(DEFAULT_QUICK_TEMPLATES);
  quickTemplates=quickTemplates.map((q,i)=>({...q,id:q.id||`qt-${uid()}`,icon:q.icon||'⚡',name:q.name||`快速模板 ${i+1}`,type:q.type||'expense',amount:Number(q.amount||0)}));
  const nameToId=new Map(categories.map(c=>[c.name,c.id]));
  for(const t of txns){
    if(!t.id)t.id=uid();
    if(t.type==='expense'&&!t.categoryId){ t.categoryId=nameToId.get(t.category)||'other'; }
    if(!t.type)t.type='expense';
    if(!t.createdAt)t.createdAt=new Date().toISOString();
  }
  for(const r of recurring){
    if(!r.id)r.id=uid();
    if(!Array.isArray(r.skipDates))r.skipDates=[];
    if(r.frequency==='monthly'&&!Array.isArray(r.monthlyDays))r.monthlyDays=[Number(r.dayOfMonth||parseDateKey(r.startDate||dateKey(new Date())).getDate())];
    if(Array.isArray(r.monthlyDays))r.monthlyDays=[...new Set(r.monthlyDays.map(Number).filter(n=>n>=1&&n<=31))].sort((a,b)=>a-b);
  }
  const foodCat=categories.find(c=>c.id==='food');
  if(foodCat&&!foodCat.subs.includes('個人餐飲'))foodCat.subs.push('個人餐飲');
  const familyCat=categories.find(c=>c.id==='family');
  if(familyCat){ if(familyCat.name==='家庭／小孩')familyCat.name='家庭'; if(!familyCat.subs.includes('孝親費'))familyCat.subs.unshift('孝親費'); }
  const fixedCat=categories.find(c=>c.id==='fixed');
  if(fixedCat&&!fixedCat.subs.includes('薪資扣除'))fixedCat.subs.splice(Math.max(0,fixedCat.subs.length-1),0,'薪資扣除');
  const migrated={...budgets};
  const mapLegacy={'餐飲':'food','交際應酬':'social','交通':'transport','家庭／小孩':'family','家庭':'family','購物':'shopping','居家生活':'home','娛樂休閒':'leisure','醫療健康':'health','固定費用':'fixed','其他':'other'};
  for(const [old,id] of Object.entries(mapLegacy)){ if(migrated[old]!=null&&migrated[`cat:${id}`]==null)migrated[`cat:${id}`]=migrated[old]; }
  if(migrated['餐飲::上班餐飲']!=null&&migrated['sub:food:上班餐飲']==null)migrated['sub:food:上班餐飲']=migrated['餐飲::上班餐飲'];
  if(migrated['餐飲::家庭餐飲']!=null&&migrated['sub:food:家庭餐飲']==null)migrated['sub:food:家庭餐飲']=migrated['餐飲::家庭餐飲'];
  budgets=migrated;
}


function historicalSplitLabel(categoryId,subcategory){
  if(categoryId==='food')return subcategory;
  if(categoryId==='transport')return subcategory;
  if(categoryId==='social')return subcategory;
  if(categoryId==='leisure')return subcategory;
  if(categoryId==='shopping')return subcategory;
  if(categoryId==='home')return '居家生活';
  if(categoryId==='health')return '醫療健康';
  return '其他';
}
function migrateHistoricalCategorySummaries(){
  let changed=false;
  // 孝親費固定歸「家庭 > 孝親費」。歷史總額不變，只改分類。
  for(const t of txns){
    if(t?.historicalSummary&&t.type==='expense'&&t.title==='孝親費'){
      if(t.categoryId!=='family'||t.subcategory!=='孝親費'){ t.categoryId='family'; t.subcategory='孝親費'; changed=true; }
    }
  }
  for(const [ym,baseRows] of Object.entries(HISTORICAL_CATEGORY_SPLITS)){
    const variable=txns.find(t=>t?.historicalSummary&&t.type==='expense'&&String(t.date||'').startsWith(ym)&&(t.id===`hist-${ym}-variable`||/歷史變動支出彙總/.test(t.title||'')));
    if(!variable)continue;
    const target=Math.round(Number(variable.amount)||0);
    if(target<=0)continue;
    const rows=baseRows.map(r=>({...r,amount:Math.round(Number(r.amount)||0)}));
    const expected=rows.reduce((a,r)=>a+r.amount,0);
    if(expected!==target){
      const other=rows.find(r=>r.categoryId==='other')||rows[rows.length-1];
      other.amount+=target-expected;
    }
    txns=txns.filter(t=>t!==variable);
    rows.filter(r=>r.amount!==0).forEach((r,i)=>{
      const label=historicalSplitLabel(r.categoryId,r.subcategory);
      txns.push({
        id:`hist-${ym}-classified-${r.categoryId}-${i+1}`,
        date:variable.date||`${ym}-28`,
        type:'expense',
        title:`歷史分類彙總｜${label}`,
        amount:r.amount,
        createdAt:variable.createdAt||new Date().toISOString(),
        historicalSummary:true,
        source:'historical-import-2026-v2',
        categoryId:r.categoryId,
        subcategory:r.subcategory,
        payment:variable.payment||'card',
        note:ym==='2026-01'?'1 月依既有歷史估算方式與 2–8 月分類結構拆分；不納入每日平均與日曆支出':'依已整理的歷史帳單與分類規則拆分；不納入每日平均與日曆支出'
      });
    });
    changed=true;
  }
  if(changed)settings={...settings,historicalCategorySplitVersion:HISTORICAL_CATEGORY_SPLIT_VERSION};
  return changed;
}

function categoryById(id){ return categories.find(c=>c.id===id)||categories.find(c=>c.id==='other')||{id:'other',name:'其他',icon:'📌',subs:['其他']}; }
function catIconByTxn(t){ return categoryById(t.categoryId).icon; }
function categoryNameByTxn(t){ return categoryById(t.categoryId).name; }
function visibleCategories(){ return categories.filter(c=>!c.hidden).sort((a,b)=>Number(!!b.favorite)-Number(!!a.favorite)); }
function ensureSelectedCategory(){ if(!categoryById(selectedCategoryId)||categoryById(selectedCategoryId).hidden)selectedCategoryId=visibleCategories()[0]?.id||categories[0]?.id||'other'; }

function txnMonth(d=viewMonth){ return txns.filter(t=>isSameMonthKey(t.date,d)); }
function expensesOfMonth(d=viewMonth){ return txnMonth(d).filter(t=>t.type==='expense'); }
function incomesOfMonth(d=viewMonth){ return txnMonth(d).filter(t=>t.type==='income'); }
function investmentsOfMonth(d=viewMonth){ return txnMonth(d).filter(t=>t.type==='investment'); }
function budgetValue(key){ return Number(budgets[key]||0); }
function spendForBudgetKey(key,d=viewMonth){
  const ex=expensesOfMonth(d).filter(t=>!isHistoricalSummary(t));
  if(key==='__total__')return sum(ex);
  if(key.startsWith('sub:')){ const [,id,...rest]=key.split(':'); const sub=rest.join(':'); return sum(ex.filter(t=>t.categoryId===id&&t.subcategory===sub)); }
  if(key.startsWith('cat:'))return sum(ex.filter(t=>t.categoryId===key.slice(4)));
  return 0;
}

function renderAll(){ if(!unlocked||!vaultLoaded)return; renderHome(); renderBudget(); renderAnalysis(); renderCategoryManager(); renderRecurringCount(); renderBackupStatus(); }
function daysInMonthOf(d){ return new Date(d.getFullYear(),d.getMonth()+1,0).getDate(); }
function averageBaseDays(d=viewMonth){
  const now=new Date();
  const target=new Date(d.getFullYear(),d.getMonth(),1).getTime();
  const current=new Date(now.getFullYear(),now.getMonth(),1).getTime();
  if(target>current)return 0;
  if(target===current)return now.getDate();
  return daysInMonthOf(d);
}
function renderHome(){
  $('monthLabelBtn').textContent=formatMonth(viewMonth);
  const ex=expensesOfMonth(), inc=incomesOfMonth(), inv=investmentsOfMonth();
  const expense=sum(ex), income=sum(inc), investment=sum(inv), balance=income-expense;
  $('monthExpense').textContent=money(expense); $('monthIncome').textContent=money(income); $('monthInvestment').textContent=money(investment);
  $('monthBalance').textContent=(balance<0?'-':'')+money(Math.abs(balance)); $('monthBalance').style.color=balance<0?'var(--expense)':'var(--income)';
  $('homeNetHero').textContent=(balance<0?'-':'')+money(Math.abs(balance)); $('homeNetHero').classList.toggle('negative',balance<0);
  $('homeNetHeroMeta').textContent=balance>=0?'收入扣除生活支出後的淨流入':'本月生活支出已高於收入';
  const baseDays=averageBaseDays(viewMonth); $('homeMonthPulse').textContent=baseDays?`${viewMonth.getMonth()+1}月 · 第 ${baseDays} 天`:`${viewMonth.getMonth()+1}月`;
  $('heroExpenseRatio').textContent=income?`支出率 ${Math.round(expense/income*100)}%`:`支出 ${money(expense)}`;
  $('heroInvestmentRatio').textContent=income?`投資／收入 ${Math.round(investment/income*100)}%`:`投資 ${money(investment)}`;
  const prev=addMonths(viewMonth,-1),prevExpense=sum(expensesOfMonth(prev)); const delta=prevExpense?((expense-prevExpense)/prevExpense*100):null;
  $('heroMonthChange').textContent=delta===null?'較上月 --':`較上月 ${delta>=0?'+':''}${delta.toFixed(0)}%`;
  renderHomeSpark(ex); renderHomeReminders(); renderQuickTemplateStrip();
  document.querySelectorAll('.summary-action[data-insight]').forEach(card=>card.classList.toggle('active',card.dataset.insight===homeInsightMode));
  renderHomeInsight(ex,inc,inv,balance);
  renderCalendar(); renderDayList();
}
function renderHomeSpark(ex){
  const box=$('homeSparkBars'); if(!box)return; box.innerHTML=''; const y=viewMonth.getFullYear(),m=viewMonth.getMonth(),base=averageBaseDays(viewMonth)||daysInMonthOf(viewMonth),end=Math.min(daysInMonthOf(viewMonth),base),start=Math.max(1,end-6); const rows=[];
  for(let d=start;d<=end;d++){const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;rows.push({day:d,value:sum(ex.filter(t=>t.date===key))});}
  const max=Math.max(1,...rows.map(r=>r.value));
  rows.forEach(r=>{const col=document.createElement('div');col.className='mini-spark-col';col.title=`${m+1}/${r.day} ${money(r.value)}`;col.innerHTML=`<i style="height:${Math.max(4,r.value/max*38)}px"></i><small>${r.day}</small>`;box.appendChild(col);});
}
function isCurrentViewMonth(){const n=new Date();return viewMonth.getFullYear()===n.getFullYear()&&viewMonth.getMonth()===n.getMonth();}
function addDaysKey(baseKey,n){const d=parseDateKey(baseKey);d.setDate(d.getDate()+n);return dateKey(d);}
function collectHomeReminders(){
  if(!isCurrentViewMonth())return [];
  const today=dateKey(new Date()),items=[];
  const pending=txns.filter(t=>t.pendingAmount&&t.date<=today);
  if(pending.length)items.push({icon:'🔔',title:`${pending.length} 筆待填金額`,meta:'電費、水費等週期帳目尚未補金額',date:pending.sort((a,b)=>a.date.localeCompare(b.date))[0].date,tone:'warn'});
  const upcoming=[];
  for(let i=0;i<=7;i++){const dk=addDaysKey(today,i);for(const p of projectedOccurrencesForDate(dk))upcoming.push(p);}
  const next=upcoming.sort((a,b)=>a.date.localeCompare(b.date))[0];
  if(next)items.push({icon:next.pendingAmount?'🟠':next.type==='income'?'🟢':next.type==='investment'?'🟣':'🔵',title:`${next.date.slice(5).replace('-','/')} ${next.title}`,meta:next.pendingAmount?'預定待填金額':`預定${next.type==='income'?'收入':next.type==='investment'?'投資':'支出'} ${money(next.amount)}`,date:next.date,tone:'info'});
  const totalBudget=budgetValue('__total__'),spent=sum(expensesOfMonth());
  if(totalBudget&&spent>totalBudget)items.push({icon:'⚠️',title:`本月預算已超出 ${money(spent-totalBudget)}`,meta:`已花 ${money(spent)}／預算 ${money(totalBudget)}`,tone:'warn'});
  const wm=sum(expensesOfMonth().filter(t=>t.categoryId==='food'&&t.subcategory==='上班餐飲')),days=averageBaseDays(viewMonth),avg=days?wm/days:0; const prev=addMonths(viewMonth,-1),prevDays=daysInMonthOf(prev),prevWm=sum(expensesOfMonth(prev).filter(t=>t.categoryId==='food'&&t.subcategory==='上班餐飲')),prevAvg=prevDays?prevWm/prevDays:0;
  if(avg&&prevAvg&&avg>prevAvg*1.2)items.push({icon:'🍱',title:'上班餐飲平均偏高',meta:`目前每日 ${money(avg)}，高於上月平均`,tone:'soft'});
  return items.slice(0,4);
}
function renderHomeReminders(){
  const panel=$('homeReminderPanel'),list=$('homeReminderList'),items=collectHomeReminders(); if(!panel||!list)return; panel.classList.toggle('hidden',!items.length); if(!items.length)return; $('homeReminderCount').textContent=String(items.length); $('homeReminderTitle').textContent=items.length===1?'有 1 件事情值得注意':`有 ${items.length} 件事情值得注意`; list.innerHTML='';
  items.forEach(item=>{const b=document.createElement('button');b.className=`reminder-item ${item.tone||''}`;b.innerHTML=`<span class="reminder-icon">${item.icon}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span><b>›</b>`; if(item.date)b.onclick=()=>{selectedDate=item.date;viewMonth=startOfMonth(parseDateKey(item.date));renderAll();setTimeout(()=>$('dayListTitle')?.scrollIntoView({behavior:'smooth',block:'center'}),50);}; else b.disabled=true; list.appendChild(b);});
}
function renderQuickTemplateStrip(){
  const box=$('quickTemplateStrip'),empty=$('quickTemplateEmpty'); if(!box)return; box.innerHTML=''; empty?.classList.toggle('hidden',quickTemplates.length>0); quickTemplates.slice(0,10).forEach(q=>{const b=document.createElement('button');b.className='quick-template-btn';b.innerHTML=`<span>${escapeHtml(q.icon||'⚡')}</span><strong>${escapeHtml(q.name)}</strong><small>${q.amount>0?money(q.amount):'補金額'}</small>`;b.onclick=()=>applyQuickTemplate(q);box.appendChild(b);});
}
function applyQuickTemplate(q){
  openEditor(null,selectedDate); setEditType(q.type||'expense'); $('titleInput').value=q.name||''; if(Number(q.amount)>0)$('amountInput').value=String(q.amount); else $('amountInput').value='';
  if(q.type==='expense'){selectedCategoryId=q.categoryId||'other';ensureSelectedCategory();renderCategoryPicker();renderSubcategories(q.subcategory);if(q.subcategory)$('subcategoryInput').value=q.subcategory;setPayment(q.payment||'card');}
  else if(q.type==='income')$('incomeCategoryInput').value=q.incomeCategory||'其他收入'; else $('investmentCategoryInput').value=q.investmentCategory||'股票／ETF';
  if(!(Number(q.amount)>0))setTimeout(openCalculator,120);
}
function categoryTotals(list){ const m=new Map(); for(const t of list)m.set(t.categoryId,(m.get(t.categoryId)||0)+Number(t.amount||0)); return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function renderCategoryBars(targetId,emptyId,ex,limit=99,detailed=false,onRowClick=null){
  const target=$(targetId); if(!target)return; target.innerHTML=''; const rows=categoryTotals(ex).slice(0,limit); $(emptyId)?.classList.toggle('hidden',rows.length>0); if(!rows.length)return;
  const max=rows[0][1]||1,total=sum(ex)||1;
  for(const [id,val] of rows){ const cat=categoryById(id); const row=document.createElement(onRowClick&&detailed?'button':'div');
    if(detailed){ row.className='analysis-row'+(onRowClick?' is-clickable':''); if(onRowClick)row.type='button'; row.innerHTML=`<div class="txn-icon">${escapeHtml(cat.icon)}</div><div class="analysis-main"><div class="topline"><strong>${escapeHtml(cat.name)}</strong><span>${Math.round(val/total*100)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,val/max*100)}%"></div></div></div><div class="analysis-amount">${money(val)}</div>${onRowClick?'<span class="row-chevron">›</span>':''}`; }
    else{ row.className='cat-row'; row.innerHTML=`<div class="cat-label">${escapeHtml(cat.icon)} ${escapeHtml(cat.name)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,val/max*100)}%"></div></div><div class="cat-value">${money(val)}</div>`; }
    if(onRowClick&&detailed)row.onclick=()=>onRowClick(id,val);
    target.appendChild(row);
  }
}
function topRowsBy(list,getKey,getMeta){
  const map=new Map();
  for(const t of list){
    const key=getKey(t);
    if(!key)continue;
    if(!map.has(key))map.set(key,{key,amount:0,count:0,...getMeta(t,key)});
    const row=map.get(key); row.amount+=(Number(t.amount)||0); row.count++;
  }
  return [...map.values()].sort((a,b)=>b.amount-a.amount);
}
function renderStatCards(targetId,items){
  const box=$(targetId); if(!box)return; box.innerHTML='';
  for(const item of items){
    const div=document.createElement('div'); div.className='hero-stat';
    div.innerHTML=`<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>${item.note?`<small>${escapeHtml(item.note)}</small>`:''}`;
    box.appendChild(div);
  }
}
function renderHomeHeroStats(items){ renderStatCards('homeHeroStats',items); }
function renderHomeQuickCards(items){
  const box=$('homeQuickCards'); box.innerHTML='';
  if(!items.length)return;
  for(const item of items){
    const btn=document.createElement(item.action?'button':'div');
    btn.className='quick-card'+(item.action?' is-clickable':'');
    if(item.action)btn.type='button';
    btn.innerHTML=`<div class="quick-card-top"><span class="quick-icon">${escapeHtml(item.icon||'•')}</span><span class="quick-label">${escapeHtml(item.label)}</span></div><strong>${escapeHtml(item.value)}</strong>${item.meta?`<p>${escapeHtml(item.meta)}</p>`:''}${item.action?'<span class="card-chevron">›</span>':''}`;
    if(item.action)btn.onclick=item.action;
    box.appendChild(btn);
  }
}
function renderInsightBars(targetId,emptyId,rows,total,color){
  const box=$(targetId), empty=$(emptyId); box.innerHTML='';
  empty.classList.toggle('hidden',rows.length>0);
  if(!rows.length)return;
  const max=rows[0].amount||1, denom=total||1;
  for(const rowData of rows){
    const row=document.createElement(rowData.action?'button':'div'); row.className='analysis-row'+(rowData.action?' is-clickable':'');
    if(rowData.action)row.type='button';
    row.innerHTML=`<div class="txn-icon">${escapeHtml(rowData.icon||'•')}</div><div class="analysis-main"><div class="topline"><strong>${escapeHtml(rowData.label)}</strong><span>${Math.round((rowData.amount/denom)*100)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,rowData.amount/max*100)}%;background:${color}"></div></div></div><div class="analysis-amount">${money(rowData.amount)}</div>${rowData.action?'<span class="row-chevron">›</span>':''}`;
    if(rowData.action)row.onclick=rowData.action;
    box.appendChild(row);
  }
}
function openInsightDetail(config){
  const items=[...(config.items||[])].sort((a,b)=>{
    const dk=String(b.date||'').localeCompare(String(a.date||''));
    if(dk!==0)return dk;
    return String(b.createdAt||'').localeCompare(String(a.createdAt||''));
  });
  insightDetailState={...config,items};
  renderInsightDetail();
  show($('insightDetailScreen'));
}
function closeInsightDetail(){ hide($('insightDetailScreen')); insightDetailState=null; }
function openTxnFromInsight(id){
  const txn=txns.find(t=>t.id===id); if(!txn)return;
  if(txn.date){ selectedDate=txn.date; viewMonth=startOfMonth(parseDateKey(txn.date)); }
  closeInsightDetail(); renderAll();
  setTimeout(()=>openTxnMenu(txn.id),30);
}
function detailMetaByTxn(t){
  const dateLabel=String(t.date||'').replace(/-/g,'/');
  if(t.type==='expense')return `${dateLabel} · ${categoryNameByTxn(t)} · ${t.subcategory||'未分類'} · ${t.payment==='cash'?'現金':'信用卡'}`;
  if(t.type==='income')return `${dateLabel} · ${t.incomeCategory||'其他收入'}`;
  return `${dateLabel} · ${t.investmentCategory||'股票／ETF'} · 投資`;
}
function detailIconByTxn(t){
  if(t.type==='expense')return catIconByTxn(t);
  if(t.type==='income')return {'薪資':'💼','獎金':'🎁','股息':'💹','退款':'↩️','其他收入':'💰'}[t.incomeCategory||'其他收入']||'💰';
  return '📈';
}
function renderInsightDetail(){
  const state=insightDetailState; if(!state)return;
  const items=state.items||[];
  const total=sum(items.filter(t=>!t.pendingAmount));
  const count=items.length;
  const avg=count?money(total/count):'—';
  const baseDays=Number(state.baseDays)||0;
  $('insightDetailTitle').textContent=state.title||'分類明細';
  $('insightDetailIcon').textContent=state.icon||'•';
  $('insightDetailPeriod').textContent=state.periodLabel||formatMonth(viewMonth);
  $('insightDetailLead').textContent=state.lead||state.title||'細項明細';
  $('insightDetailDesc').textContent=state.desc||'點任一筆細項即可查看或編輯。';
  $('insightDetailSub').textContent=count?`共 ${count} 筆 · 合計 ${money(total)}`:'目前沒有細項';
  renderStatCards('insightDetailStats',[
    {label:'合計金額',value:money(total),note:state.totalNote||'依目前篩選條件計算'},
    {label:'記錄筆數',value:`${count} 筆`,note:state.countNote||'點任一筆可再查看或編輯'},
    {label:baseDays?'平均每日':'平均每筆',value:baseDays?money(total/baseDays):avg,note:baseDays?`以 ${baseDays} 天平均`:'依這個清單平均'}
  ]);
  const list=$('insightDetailList'), empty=$('insightDetailEmpty');
  list.innerHTML='';
  empty.classList.toggle('hidden',items.length>0);
  for(const t of items){
    const row=document.createElement('div');
    row.className='txn-row detail-clickable'+(t.pendingAmount?' pending-txn':'');
    row.setAttribute('role','button'); row.tabIndex=0;
    const cls=t.type==='income'?'income':t.type==='investment'?'investment':'expense';
    const amountText=t.pendingAmount?'待填金額':`${t.type==='expense'?'-':''}${money(t.amount)}`;
    row.innerHTML=`<div class="txn-icon">${detailIconByTxn(t)}</div><div class="txn-main"><strong>${escapeHtml(t.title||state.title||'未命名')}</strong><span>${escapeHtml(detailMetaByTxn(t))}</span>${t.note?`<span class="detail-note">備註：${escapeHtml(t.note)}</span>`:''}</div><div class="txn-amount ${cls}">${amountText}</div><div class="detail-chevron">›</div>`;
    row.onclick=()=>openTxnFromInsight(t.id);
    row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTxnFromInsight(t.id);}};
    list.appendChild(row);
  }
}
function openExpenseDetailByCategory(categoryId,title=null,periodLabel=formatMonth(viewMonth),items=null,baseDays=0){
  const cat=categoryById(categoryId);
  const list=items||expensesOfMonth().filter(t=>!isHistoricalSummary(t)&&t.categoryId===categoryId);
  openInsightDetail({title:title||cat.name,icon:cat.icon,lead:title||cat.name,periodLabel,items:list,baseDays,desc:`查看 ${title||cat.name} 的每一筆細項；點一下可再編輯。`});
}
function openExpenseDetailBySubcategory(categoryId,subcategory,label,icon,periodLabel=formatMonth(viewMonth),items=null,baseDays=0){
  const list=items||expensesOfMonth().filter(t=>!isHistoricalSummary(t)&&t.categoryId===categoryId&&t.subcategory===subcategory);
  openInsightDetail({title:label,icon:icon||categoryById(categoryId).icon,lead:label,periodLabel,items:list,baseDays,desc:`查看 ${label} 的細項紀錄；點一下可再編輯。`});
}
function openIncomeDetailByCategory(name,periodLabel=formatMonth(viewMonth),items=null,baseDays=0){
  const icons={'薪資':'💼','獎金':'🎁','股息':'💹','退款':'↩️','其他收入':'💰'};
  const list=items||incomesOfMonth().filter(t=>!isHistoricalSummary(t)&&((t.incomeCategory||'其他收入')===name));
  openInsightDetail({title:name,icon:icons[name]||'💰',lead:name,periodLabel,items:list,baseDays,desc:`查看 ${name} 的每一筆收入紀錄；點一下可再編輯。`});
}
function openInvestmentDetailByKey(name,periodLabel=formatMonth(viewMonth),items=null){
  const list=items||investmentsOfMonth().filter(t=>!isHistoricalSummary(t)&&((t.title||t.investmentCategory||'投資')===name));
  openInsightDetail({title:name,icon:'📈',lead:name,periodLabel,items:list,desc:'查看這個投資項目的每一筆投入紀錄；點一下可再編輯。'});
}
function openBalanceDetail(kind,periodLabel=formatMonth(viewMonth),items=null,baseDays=0){
  const configs={
    income:{title:'收入',icon:'💚',desc:'本期所有收入紀錄'},
    expense:{title:'支出',icon:'❤️',desc:'本期所有生活支出紀錄'},
    investment:{title:'投資',icon:'💜',desc:'本期所有投資投入紀錄'}
  };
  const cfg=configs[kind]; if(!cfg)return;
  const list=items||(
    kind==='income'?incomesOfMonth().filter(t=>!isHistoricalSummary(t)):
    kind==='investment'?investmentsOfMonth().filter(t=>!isHistoricalSummary(t)):
    expensesOfMonth().filter(t=>!isHistoricalSummary(t))
  );
  openInsightDetail({title:cfg.title,icon:cfg.icon,lead:cfg.title,periodLabel,items:list,baseDays:kind==='expense'?baseDays:0,desc:`${cfg.desc}；點任一筆可查看或編輯。`});
}
function renderHomeInsight(ex,inc,inv,balance){
  const title=$('homeInsightTitle'), sub=$('homeInsightSub'), empty=$('homeInsightEmpty');
  const baseDays=averageBaseDays(viewMonth);
  if(homeInsightMode==='income'){
    title.textContent='本月收入來源'; sub.textContent='快速看出錢從哪裡進來';
    const rows=topRowsBy(inc,t=>t.incomeCategory||'其他收入',(t,key)=>({label:key,icon:{'薪資':'💼','獎金':'🎁','股息':'💹','退款':'↩️','其他收入':'💰'}[key]||'💰'}));
    const total=sum(inc), top=rows[0];
    renderHomeHeroStats([
      {label:'收入筆數',value:`${inc.length} 筆`,note:'本月已記錄'},
      {label:'最大來源',value:top?top.label:'尚無',note:top?money(top.amount):'—'},
      {label:'平均每日收入',value:baseDays?money(total/baseDays):'—',note:baseDays?`以本月目前 ${baseDays} 天平均`:'未到該月'}
    ]);
    renderHomeQuickCards(rows.slice(0,6).map(r=>({icon:r.icon,label:r.label,value:money(r.amount),meta:`${r.count} 筆 · ${Math.round((r.amount/(total||1))*100)}%`,action:()=>openIncomeDetailByCategory(r.label,formatMonth(viewMonth),inc.filter(t=>!isHistoricalSummary(t)&&(t.incomeCategory||'其他收入')===r.label),baseDays)})));
    renderInsightBars('homeInsightBars','homeInsightEmpty',rows.map(r=>({...r,action:()=>openIncomeDetailByCategory(r.label,formatMonth(viewMonth),inc.filter(t=>!isHistoricalSummary(t)&&(t.incomeCategory||'其他收入')===r.label),baseDays)})),total,'var(--income)');
    return;
  }
  if(homeInsightMode==='investment'){
    title.textContent='本月投資配置'; sub.textContent='投資不列入支出，但可以一起追蹤';
    const rows=topRowsBy(inv,t=>t.title||t.investmentCategory||'投資',(t,key)=>({label:key,icon:'📈',note:t.investmentCategory||'股票／ETF'}));
    const total=sum(inv), top=rows[0], avg=inv.length?money(total/inv.length):'—';
    renderHomeHeroStats([
      {label:'投入筆數',value:`${inv.length} 筆`,note:'本月投資紀錄'},
      {label:'主要標的',value:top?top.label:'尚無',note:top?money(top.amount):'—'},
      {label:'平均單筆投入',value:avg,note:inv.length?'依本月投資筆數計算':'尚無投資'}
    ]);
    renderHomeQuickCards(rows.slice(0,6).map(r=>({icon:'📈',label:r.label,value:money(r.amount),meta:`${r.count} 筆${r.note?` · ${r.note}`:''}`,action:()=>openInvestmentDetailByKey(r.label,formatMonth(viewMonth),inv.filter(t=>!isHistoricalSummary(t)&&(t.title||t.investmentCategory||'投資')===r.label))})));
    renderInsightBars('homeInsightBars','homeInsightEmpty',rows.map(r=>({...r,action:()=>openInvestmentDetailByKey(r.label,formatMonth(viewMonth),inv.filter(t=>!isHistoricalSummary(t)&&(t.title||t.investmentCategory||'投資')===r.label))})),total,'var(--investment)');
    return;
  }
  if(homeInsightMode==='balance'){
    title.textContent='本月生活收支'; sub.textContent='用圖像看出收入、支出與淨流入';
    const incomeTotal=sum(inc), expenseTotal=sum(ex), investTotal=sum(inv);
    const remaining=Math.max(0,incomeTotal-expenseTotal);
    const rows=[
      {label:'收入',icon:'💚',amount:incomeTotal,action:()=>openBalanceDetail('income',formatMonth(viewMonth),inc.filter(t=>!isHistoricalSummary(t)),baseDays)},
      {label:'支出',icon:'❤️',amount:expenseTotal,action:()=>openBalanceDetail('expense',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)),baseDays)},
      {label:'投資',icon:'💜',amount:investTotal,action:()=>openBalanceDetail('investment',formatMonth(viewMonth),inv.filter(t=>!isHistoricalSummary(t)))},
      {label:'淨流入',icon:balance>=0?'📈':'📉',amount:Math.abs(balance)}
    ].filter(r=>r.amount>0);
    const spendingRate=incomeTotal?`${Math.round(expenseTotal/incomeTotal*100)}%`:'—';
    const savingRate=incomeTotal?`${Math.round(remaining/incomeTotal*100)}%`:'—';
    renderHomeHeroStats([
      {label:'本月淨流入',value:(balance<0?'-':'')+money(Math.abs(balance)),note:balance>=0?'收入大於支出':'支出大於收入'},
      {label:'支出占收入',value:spendingRate,note:incomeTotal?`${money(expenseTotal)} / ${money(incomeTotal)}`:'尚無收入'},
      {label:'可留存比例',value:savingRate,note:incomeTotal?`未含投資 ${money(remaining)}`:'尚無收入'}
    ]);
    renderHomeQuickCards([
      {icon:'💚',label:'收入',value:money(incomeTotal),meta:'本月總收入',action:()=>openBalanceDetail('income',formatMonth(viewMonth),inc.filter(t=>!isHistoricalSummary(t)),baseDays)},
      {icon:'❤️',label:'支出',value:money(expenseTotal),meta:'本月總支出',action:()=>openBalanceDetail('expense',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)),baseDays)},
      {icon:'💜',label:'投資',value:money(investTotal),meta:'不列入支出',action:()=>openBalanceDetail('investment',formatMonth(viewMonth),inv.filter(t=>!isHistoricalSummary(t)))},
      {icon:balance>=0?'📈':'📉',label:'收支差額',value:(balance<0?'-':'')+money(Math.abs(balance)),meta:'收入－支出'}
    ]);
    renderInsightBars('homeInsightBars','homeInsightEmpty',rows,Math.max(incomeTotal,expenseTotal,investTotal,Math.abs(balance)), '#5b7ee5');
    return;
  }
  title.textContent='本月支出去向'; sub.textContent='點卡片就能切到收入、生活收支或投資';
  const total=sum(ex), categoryRows=categoryTotals(ex).map(([id,amount])=>({label:categoryById(id).name,icon:categoryById(id).icon,amount,action:()=>openExpenseDetailByCategory(id,categoryById(id).name,formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)&&t.categoryId===id),baseDays)}));
  const top=categoryRows[0];
  const workMealAmount=sum(ex.filter(t=>t.categoryId==='food'&&t.subcategory==='上班餐飲'));
  const familyMealAmount=sum(ex.filter(t=>t.categoryId==='food'&&t.subcategory==='家庭餐飲'));
  const socialAmount=sum(ex.filter(t=>t.categoryId==='social'));
  const fixedAmount=sum(ex.filter(t=>t.categoryId==='fixed'));
  const homeAmount=sum(ex.filter(t=>t.categoryId==='home'));
  renderHomeHeroStats([
    {label:'支出筆數',value:`${ex.length} 筆`,note:'本月已記錄'},
    {label:'最大花費',value:top?top.label:'尚無',note:top?money(top.amount):'—'},
    {label:'平均每日支出',value:baseDays?money(sum(ex.filter(t=>!isHistoricalSummary(t)))/baseDays):'—',note:baseDays?`僅以逐筆紀錄／本月目前 ${baseDays} 天平均`:'未到該月'}
  ]);
  const quickCards=[
    {icon:'🍱',label:'上班餐飲',value:money(workMealAmount),meta:baseDays?`平均每日 ${money(workMealAmount/baseDays)}`:'尚未開始',action:()=>openExpenseDetailBySubcategory('food','上班餐飲','上班餐飲','🍱',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)&&t.categoryId==='food'&&t.subcategory==='上班餐飲'),baseDays)},
    {icon:'🍽️',label:'家庭餐飲',value:money(familyMealAmount),meta:total?`${Math.round((familyMealAmount/(total||1))*100)}%`:'本月尚無支出',action:()=>openExpenseDetailBySubcategory('food','家庭餐飲','家庭餐飲','🍽️',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)&&t.categoryId==='food'&&t.subcategory==='家庭餐飲'),baseDays)},
    {icon:'🥂',label:'交際應酬',value:money(socialAmount),meta:total?`${Math.round((socialAmount/(total||1))*100)}%`:'本月尚無支出',action:()=>openExpenseDetailByCategory('social','交際應酬',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)&&t.categoryId==='social'),baseDays)},
    {icon:'🏠',label:'居家生活',value:money(homeAmount),meta:total?`${Math.round((homeAmount/(total||1))*100)}%`:'本月尚無支出',action:()=>openExpenseDetailByCategory('home','居家生活',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)&&t.categoryId==='home'),baseDays)},
    {icon:'🧾',label:'固定費用',value:money(fixedAmount),meta:total?`${Math.round((fixedAmount/(total||1))*100)}%`:'本月尚無支出',action:()=>openExpenseDetailByCategory('fixed','固定費用',formatMonth(viewMonth),ex.filter(t=>!isHistoricalSummary(t)&&t.categoryId==='fixed'),baseDays)}
  ].filter(item=>item.value!==money(0) || ex.length===0 || item.label==='上班餐飲');
  renderHomeQuickCards(quickCards);
  renderInsightBars('homeInsightBars','homeInsightEmpty',categoryRows,total,'var(--accent)');
}
function renderCalendar(){
  const grid=$('calendarGrid'); grid.innerHTML=''; const y=viewMonth.getFullYear(),m=viewMonth.getMonth(),first=new Date(y,m,1),start=new Date(y,m,1-first.getDay());
  const daily={},pending={}; for(const t of expensesOfMonth().filter(t=>!isHistoricalSummary(t)))if(!t.pendingAmount)daily[t.date]=(daily[t.date]||0)+Number(t.amount||0); for(const t of txns.filter(t=>t.pendingAmount&&isSameMonthKey(t.date)))pending[t.date]=(pending[t.date]||0)+1;
  for(let i=0;i<42;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const key=dateKey(d),planned=projectedOccurrencesForDate(key),actual=txns.filter(t=>t.date===key&&!isHistoricalSummary(t)); const btn=document.createElement('button'); btn.className='day-cell';
    if(d.getMonth()!==m)btn.classList.add('outside'); if(key===selectedDate)btn.classList.add('selected'); if(key===dateKey(new Date()))btn.classList.add('today');
    const plannedPending=planned.filter(x=>x.pendingAmount).length; const plannedHtml=planned.length?`<span class="day-scheduled">${plannedPending?'🔔 待填': '◌ 預定'}${planned.length>1?`×${planned.length}`:''}</span>`:'';
    const dotTypes=[]; if(actual.some(t=>t.type==='expense'&&!t.pendingAmount))dotTypes.push('expense'); if(actual.some(t=>t.type==='income'&&!t.pendingAmount))dotTypes.push('income'); if(actual.some(t=>t.type==='investment'&&!t.pendingAmount))dotTypes.push('investment'); if(actual.some(t=>t.pendingAmount))dotTypes.push('pending'); if(planned.length)dotTypes.push('planned');
    const dots=dotTypes.length?`<span class="day-dots">${dotTypes.map(x=>`<i class="${x}"></i>`).join('')}</span>`:'';
    btn.innerHTML=`<span class="day-num">${d.getDate()}</span>${dots}${daily[key]?`<span class="day-spend">-${money(daily[key]).slice(1)}</span>`:''}${pending[key]?`<span class="day-pending">🔔 待填${pending[key]>1?`×${pending[key]}`:''}</span>`:''}${plannedHtml}`;
    btn.onclick=()=>{ selectedDate=key; if(d.getMonth()!==m)viewMonth=startOfMonth(d); renderAll(); setTimeout(()=>$('dayListTitle')?.scrollIntoView({behavior:'smooth',block:'center'}),20); }; grid.appendChild(btn);
  }
}

function renderDayList(){
  const d=parseDateKey(selectedDate),actual=txns.filter(t=>t.date===selectedDate&&!isHistoricalSummary(t)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),planned=projectedOccurrencesForDate(selectedDate),list=[...actual,...planned];
  $('dayListTitle').textContent=`${d.getMonth()+1}/${d.getDate()} 明細`; $('dayList').innerHTML=''; $('dayEmpty').classList.toggle('hidden',list.length>0);
  const ex=sum(actual.filter(t=>t.type==='expense'&&!t.pendingAmount)),inv=sum(actual.filter(t=>t.type==='investment')),pendingCount=actual.filter(t=>t.pendingAmount).length; let sub=actual.length?`${actual.length} 筆 · 支出 ${money(ex)}${inv?` · 投資 ${money(inv)}`:''}${pendingCount?` · ${pendingCount} 筆待填`:''}`:'當日尚無正式紀錄'; if(planned.length)sub+=` · ${planned.length} 筆預定`; $('dayListSub').textContent=sub;
  for(const t of list){ const row=document.createElement('div'); row.className='txn-row'+(t.pendingAmount?' pending-txn':'')+(t.planned?' planned-txn':''); let icon='💰',meta=t.incomeCategory||'收入',sign='+',cls='income';
    if(t.type==='expense'){ icon=catIconByTxn(t); meta=`${categoryNameByTxn(t)} · ${t.subcategory||'未分類'} · ${t.payment==='cash'?'現金':'信用卡'}`; sign='-'; cls='expense'; }
    if(t.type==='investment'){ icon='📈'; meta=`投資 · ${t.investmentCategory||'股票／ETF'} · 不列入支出`; sign=''; cls='investment'; }
    if(t.pendingAmount){ icon='🔔'; meta=`${meta} · ${t.planned?'預定待填':'週期提醒待填金額'}`; sign=''; cls='pending'; }
    if(t.planned&&!t.pendingAmount)meta=`預定${t.type==='expense'?'支出':t.type==='income'?'收入':'投資'} · ${meta}`;
    const amountHtml=t.pendingAmount?'待填金額':`${t.planned?'預定 ':''}${sign}${money(t.amount)}`;
    row.innerHTML=`<div class="txn-icon">${icon}</div><div class="txn-main"><strong>${escapeHtml(t.title||meta)}</strong><span>${escapeHtml(meta)}</span></div><div class="txn-amount ${cls}">${amountHtml}</div>${t.planned?'<button class="more-btn planned-rule-btn" aria-label="編輯週期">↻</button>':'<button class="more-btn" aria-label="更多">…</button>'}`;
    const more=row.querySelector('.more-btn'); if(t.planned)more.onclick=()=>openRecurringEditor(t.recurringId); else more.onclick=()=>openTxnMenu(t.id); $('dayList').appendChild(row);
  }
}

function budgetRows(){
  const rows=[{key:'__total__',label:'本月總支出',icon:'◎'}];
  const food=categories.find(c=>c.id==='food');
  if(food){ if(food.subs.includes('上班餐飲'))rows.push({key:'sub:food:上班餐飲',label:'上班餐飲',icon:'🍱'}); if(food.subs.includes('家庭餐飲'))rows.push({key:'sub:food:家庭餐飲',label:'家庭餐飲',icon:'🍽️'}); }
  for(const c of categories.filter(c=>!c.hidden&&c.id!=='food'))rows.push({key:`cat:${c.id}`,label:c.name,icon:c.icon});
  return rows;
}
function openBudgetDetailByKey(key,label,icon){
  const periodLabel=`${formatMonth(viewMonth)} · 預算明細`;
  const items=expensesOfMonth().filter(t=>!isHistoricalSummary(t));
  if(key==='__total__'){
    openBalanceDetail('expense',periodLabel,items,averageBaseDays(viewMonth));
    return;
  }
  if(key.startsWith('sub:')){
    const [,categoryId,...rest]=key.split(':');
    const subcategory=rest.join(':');
    const list=items.filter(t=>t.categoryId===categoryId&&t.subcategory===subcategory);
    openExpenseDetailBySubcategory(categoryId,subcategory,label,icon,periodLabel,list,averageBaseDays(viewMonth));
    return;
  }
  if(key.startsWith('cat:')){
    const categoryId=key.slice(4);
    const list=items.filter(t=>t.categoryId===categoryId);
    openExpenseDetailByCategory(categoryId,label,periodLabel,list,averageBaseDays(viewMonth));
  }
}
function renderBudget(){
  $('budgetMonthLabel').textContent=formatMonth(viewMonth); const spent=sum(expensesOfMonth().filter(t=>!isHistoricalSummary(t))),total=budgetValue('__total__'); $('totalBudgetValue').textContent=total?money(total):'未設定'; $('budgetSpentValue').textContent=money(spent); $('budgetRemainValue').textContent=total?money(total-spent):'--';
  const pct=total?Math.min(100,spent/total*100):0; $('totalBudgetProgress').style.width=`${pct}%`; $('totalBudgetProgress').classList.toggle('over',total>0&&spent>total);
  const list=$('budgetCategoryList'); list.innerHTML=''; for(const item of budgetRows().slice(1)){ const b=budgetValue(item.key),s=spendForBudgetKey(item.key),p=b?Math.min(100,s/b*100):0; const row=document.createElement('button'); row.type='button'; row.className='budget-row is-clickable'; row.innerHTML=`<strong>${escapeHtml(item.icon)} ${escapeHtml(item.label)}</strong><span class="budget-amount">${money(s)} / ${b?money(b):'未設定'}</span><div class="progress-track"><div class="progress-fill ${b&&s>b?'over':''}" style="width:${p}%"></div></div><p>${b?(s>b?`已超出 ${money(s-b)}`:`還可使用 ${money(b-s)}`):'尚未設定預算'}</p><span class="row-chevron">›</span>`; row.onclick=()=>openBudgetDetailByKey(item.key,item.label,item.icon); list.appendChild(row); }
}
function analysisPeriodTxns(){
  if(analysisMode==='year') return txns.filter(t=>parseDateKey(t.date).getFullYear()===analysisYear);
  const mk=`${analysisYear}-${String(analysisMonth+1).padStart(2,'0')}`;
  return txns.filter(t=>String(t.date||'').slice(0,7)===mk);
}
function incomeCategoryTotals(list){ const m=new Map(); for(const t of list){ const k=t.incomeCategory||'其他收入'; m.set(k,(m.get(k)||0)+Number(t.amount||0)); } return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function renderIncomeRanking(list,onRowClick=null){ const box=$('incomeRanking'); box.innerHTML=''; const rows=incomeCategoryTotals(list); $('incomeRankingEmpty').classList.toggle('hidden',rows.length>0); if(!rows.length)return; const total=sum(list)||1,max=rows[0][1]||1; const icons={'薪資':'💼','獎金':'🎁','股息':'💹','退款':'↩️','其他收入':'💰'}; for(const [name,val] of rows){ const row=document.createElement(onRowClick?'button':'div'); row.className='analysis-row'+(onRowClick?' is-clickable':''); if(onRowClick)row.type='button'; row.innerHTML=`<div class="income-rank-icon">${icons[name]||'💰'}</div><div class="analysis-main"><div class="topline"><strong>${escapeHtml(name)}</strong><span>${Math.round(val/total*100)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,val/max*100)}%"></div></div></div><div class="analysis-amount">${money(val)}</div>${onRowClick?'<span class="row-chevron">›</span>':''}`; if(onRowClick)row.onclick=()=>onRowClick(name,val); box.appendChild(row); } }
function renderAnalysis(){
  $('analysisYearLabel').textContent=`${analysisYear} 年`; $('analysisYearModeBtn').classList.toggle('active',analysisMode==='year'); $('analysisMonthModeBtn').classList.toggle('active',analysisMode==='month'); $('analysisMonthSelect').classList.toggle('hidden',analysisMode!=='month'); $('analysisMonthSelect').value=String(analysisMonth);
  const list=analysisPeriodTxns(), ex=list.filter(t=>t.type==='expense'), inc=list.filter(t=>t.type==='income'), inv=list.filter(t=>t.type==='investment'); const expense=sum(ex),income=sum(inc),net=income-expense;
  $('analysisIncomeLabel').textContent=analysisMode==='year'?'全年收入':'本月收入'; $('analysisExpenseLabel').textContent=analysisMode==='year'?'全年支出':'本月支出'; $('analysisTotalIncome').textContent=money(income); $('analysisTotalExpense').textContent=money(expense); $('analysisTotalInvestment').textContent=money(sum(inv)); $('analysisNetBalance').textContent=(net<0?'-':'')+money(Math.abs(net)); $('analysisNetBalance').style.color=net<0?'var(--expense)':'var(--income)';
  renderAnalysisDonut(ex); renderIncomeRanking(inc,(name)=>openIncomeDetailByCategory(name,analysisMode==='year'?`${analysisYear} 年`:`${analysisYear} 年 ${analysisMonth+1} 月`,inc.filter(t=>(t.incomeCategory||'其他收入')===name),analysisMode==='month'?analysisPeriodDays():0)); renderCategoryBars('expenseRanking','expenseRankingEmpty',ex,99,true,(id)=>openExpenseDetailByCategory(id,categoryById(id).name,analysisMode==='year'?`${analysisYear} 年`:`${analysisYear} 年 ${analysisMonth+1} 月`,ex.filter(t=>t.categoryId===id),analysisMode==='month'?analysisPeriodDays():0)); renderInvestmentRanking(inv,(name)=>openInvestmentDetailByKey(name,analysisMode==='year'?`${analysisYear} 年`:`${analysisYear} 年 ${analysisMonth+1} 月`,inv.filter(t=>(t.title||t.investmentCategory||'投資')===name)));
  const wm=ex.filter(t=>t.categoryId==='food'&&t.subcategory==='上班餐飲'),amt=sum(wm),avgBase=analysisPeriodDays(); $('analysisWorkMealAmount').textContent=money(amt); $('analysisWorkMealCount').textContent=String(wm.length); $('analysisWorkMealAvg').textContent=money(avgBase?amt/avgBase:0);
  $('cashAmount').textContent=money(sum(ex.filter(t=>t.payment==='cash'))); $('cardAmount').textContent=money(sum(ex.filter(t=>t.payment!=='cash'))); renderAnalysisTrend(); renderAnalysisComparison();
}
function analysisPeriodDays(){
  const now=new Date();
  if(analysisMode==='month')return averageBaseDays(new Date(analysisYear,analysisMonth,1));
  if(analysisYear>now.getFullYear())return 0;
  if(analysisYear<now.getFullYear())return Math.round((new Date(analysisYear+1,0,1)-new Date(analysisYear,0,1))/86400000);
  return Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate())-new Date(now.getFullYear(),0,1))/86400000)+1;
}
function renderAnalysisDonut(ex){
  const donut=$('analysisDonut'),legend=$('analysisDonutLegend'); if(!donut||!legend)return; const total=sum(ex); $('analysisDonutTotal').textContent=money(total); legend.innerHTML='';
  const palette=['#e97d72','#f3b45d','#6db69f','#6d8ed6','#a485d6','#95a75c']; const rows=categoryTotals(ex); if(!rows.length){donut.style.background='conic-gradient(#edf0f3 0 100%)';legend.innerHTML='<div class="donut-empty">還沒有支出資料</div>';return;}
  const top=rows.slice(0,5).map(([id,amount])=>({label:categoryById(id).name,icon:categoryById(id).icon,amount})); const other=rows.slice(5).reduce((a,[,v])=>a+v,0); if(other)top.push({label:'其他',icon:'•••',amount:other}); let cursor=0; const stops=[];
  top.forEach((r,i)=>{const start=cursor,end=cursor+r.amount/(total||1)*100;stops.push(`${palette[i%palette.length]} ${start}% ${end}%`);cursor=end;const item=document.createElement('div');item.className='donut-legend-item';item.innerHTML=`<i style="background:${palette[i%palette.length]}"></i><span>${escapeHtml(r.icon)} ${escapeHtml(r.label)}</span><strong>${Math.round(r.amount/(total||1)*100)}%</strong>`;legend.appendChild(item);}); donut.style.background=`conic-gradient(${stops.join(',')})`;
}
function renderInvestmentRanking(inv,onRowClick=null){
  const box=$('investmentRanking'),empty=$('investmentRankingEmpty'); if(!box)return; box.innerHTML=''; const rows=topRowsBy(inv,t=>t.title||t.investmentCategory||'投資',(t,key)=>({label:key,icon:'📈'})); empty.classList.toggle('hidden',rows.length>0); if(!rows.length)return; const total=sum(inv)||1,max=rows[0].amount||1;
  rows.forEach(r=>{const row=document.createElement(onRowClick?'button':'div');row.className='analysis-row'+(onRowClick?' is-clickable':''); if(onRowClick)row.type='button'; row.innerHTML=`<div class="txn-icon investment-icon">📈</div><div class="analysis-main"><div class="topline"><strong>${escapeHtml(r.label)}</strong><span>${Math.round(r.amount/total*100)}%</span></div><div class="bar-track"><div class="bar-fill investment-fill" style="width:${Math.max(2,r.amount/max*100)}%"></div></div></div><div class="analysis-amount">${money(r.amount)}</div>${onRowClick?'<span class="row-chevron">›</span>':''}`; if(onRowClick)row.onclick=()=>onRowClick(r.label,r.amount); box.appendChild(row);});
}
function renderAnalysisTrend(){ const box=$('analysisTrend'); box.innerHTML=''; box.classList.toggle('monthly-days',analysisMode==='month'); let rows=[]; if(analysisMode==='year'){ $('analysisTrendTitle').textContent='全年月度趨勢'; $('analysisTrendSub').textContent='收入與支出逐月比較'; for(let m=0;m<12;m++){ const mk=`${analysisYear}-${String(m+1).padStart(2,'0')}`; const l=txns.filter(t=>String(t.date||'').slice(0,7)===mk); rows.push({label:`${m+1}月`,income:sum(l.filter(t=>t.type==='income')),expense:sum(l.filter(t=>t.type==='expense'))}); } } else { $('analysisTrendTitle').textContent='本月每日趨勢'; $('analysisTrendSub').textContent='每天的收入與支出'; const days=new Date(analysisYear,analysisMonth+1,0).getDate(); for(let d=1;d<=days;d++){ const key=`${analysisYear}-${String(analysisMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; const l=txns.filter(t=>t.date===key&&!isHistoricalSummary(t)); rows.push({label:String(d),income:sum(l.filter(t=>t.type==='income')),expense:sum(l.filter(t=>t.type==='expense'))}); } }
  const max=Math.max(1,...rows.flatMap(r=>[r.income,r.expense])); const legend=document.createElement('div'); legend.className='trend-legend'; legend.innerHTML='<span><i class="legend-dot"></i>收入</span><span><i class="legend-dot expense"></i>支出</span>'; box.before(legend); box.parentElement.querySelectorAll('.trend-legend').forEach((el,i,a)=>{if(i<a.length-1)el.remove();}); for(const r of rows){ const col=document.createElement('div'); col.className='dual-col'; col.title=`${r.label} 收入 ${money(r.income)} / 支出 ${money(r.expense)}`; col.innerHTML=`<div class="dual-bars"><div class="dual-bar" style="height:${Math.max(2,r.income/max*125)}px"></div><div class="dual-bar expense" style="height:${Math.max(2,r.expense/max*125)}px"></div></div><small>${r.label}</small>`; box.appendChild(col); } }
function renderAnalysisComparison(){
  const box=$('analysisComparison'); box.innerHTML=''; const item=(label,val,cls='')=>{const d=document.createElement('div');d.className='comparison-item';d.innerHTML=`<span>${escapeHtml(label)}</span><strong class="${cls}">${escapeHtml(val)}</strong>`;box.appendChild(d);};
  if(analysisMode==='month'){
    const cur=new Date(analysisYear,analysisMonth,1),prev=addMonths(cur,-1),curKey=monthKey(cur),prevKey=monthKey(prev); const currentExpense=sum(txns.filter(t=>t.type==='expense'&&String(t.date).slice(0,7)===curKey)),previousExpense=sum(txns.filter(t=>t.type==='expense'&&String(t.date).slice(0,7)===prevKey)),currentIncome=sum(txns.filter(t=>t.type==='income'&&String(t.date).slice(0,7)===curKey)),previousIncome=sum(txns.filter(t=>t.type==='income'&&String(t.date).slice(0,7)===prevKey));
    const expPct=previousExpense?((currentExpense-previousExpense)/previousExpense*100):null,incPct=previousIncome?((currentIncome-previousIncome)/previousIncome*100):null;
    item('較上月支出',expPct===null?'無上月資料':`${expPct>=0?'+':''}${expPct.toFixed(1)}%`,expPct>0?'negative':expPct<0?'positive':''); item('較上月收入',incPct===null?'無上月資料':`${incPct>=0?'+':''}${incPct.toFixed(1)}%`,incPct>0?'positive':incPct<0?'negative':'');
    const months=[]; for(let m=0;m<12;m++){const mk=`${analysisYear}-${String(m+1).padStart(2,'0')}`; const v=sum(txns.filter(t=>t.type==='expense'&&String(t.date).slice(0,7)===mk)); if(v>0)months.push(v);} const avg=months.length?months.reduce((a,b)=>a+b,0)/months.length:0; item('今年有資料月份平均支出',money(avg)); item('本月 vs 年平均',avg?`${currentExpense>=avg?'+':''}${((currentExpense-avg)/avg*100).toFixed(1)}%`:'—',currentExpense>avg?'negative':currentExpense<avg?'positive':'');
  } else {
    const vals=[]; for(let m=0;m<12;m++){const mk=`${analysisYear}-${String(m+1).padStart(2,'0')}`;vals.push({m:m+1,expense:sum(txns.filter(t=>t.type==='expense'&&String(t.date).slice(0,7)===mk)),income:sum(txns.filter(t=>t.type==='income'&&String(t.date).slice(0,7)===mk))});}
    const exNon=vals.filter(x=>x.expense>0),inNon=vals.filter(x=>x.income>0); const avg=exNon.length?exNon.reduce((a,x)=>a+x.expense,0)/exNon.length:0; item('有資料月份平均支出',money(avg));
    if(exNon.length){const hi=[...exNon].sort((a,b)=>b.expense-a.expense)[0],lo=[...exNon].sort((a,b)=>a.expense-b.expense)[0];item('最高支出月份',`${hi.m} 月 · ${money(hi.expense)}`);item('最低支出月份',`${lo.m} 月 · ${money(lo.expense)}`);} else item('最高／最低支出月份','尚無資料');
    if(inNon.length){const hiIn=[...inNon].sort((a,b)=>b.income-a.income)[0];item('最高收入月份',`${hiIn.m} 月 · ${money(hiIn.income)}`,'positive');} else item('最高收入月份','尚無資料');
  }
}


function setPage(page){ if(page==='analysis'){analysisYear=viewMonth.getFullYear();analysisMonth=viewMonth.getMonth();} for(const s of ['homeScreen','budgetScreen','analysisScreen'])hide($(s)); if(page==='budget')show($('budgetScreen')); else if(page==='analysis')show($('analysisScreen')); else show($('homeScreen')); document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page)); renderAll(); }
function renderCategoryPicker(){
  ensureSelectedCategory(); const box=$('categoryPicker'); box.innerHTML=''; for(const c of visibleCategories()){ const b=document.createElement('button'); b.type='button'; b.className='category-btn'+(c.id===selectedCategoryId?' active':''); b.innerHTML=`<span>${escapeHtml(c.icon)}</span>${escapeHtml(c.name)}`; b.onclick=()=>{selectedCategoryId=c.id;renderCategoryPicker();renderSubcategories();}; box.appendChild(b); }
}
function renderSubcategories(preferred){ const c=categoryById(selectedCategoryId),sel=$('subcategoryInput'); sel.innerHTML=''; const subs=(c.subs&&c.subs.length)?c.subs:['其他']; for(const s of subs){ const o=document.createElement('option'); o.value=s;o.textContent=s;sel.appendChild(o); } if(preferred&&subs.includes(preferred))sel.value=preferred; }
function normalizeCalcExpression(expr=''){ return String(expr).replace(/\s+/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'); }
function prettyCalcExpression(expr=''){ return String(expr).replace(/\*/g,' × ').replace(/\//g,' ÷ ').replace(/\+/g,' + ').replace(/-/g,' − ').replace(/\s+/g,' ').trim(); }
function evaluateExpression(expr){
  const raw=normalizeCalcExpression(expr); if(!raw)return 0; if(!/^[0-9.+\-*/]+$/.test(raw))throw new Error('invalid');
  const tokens=raw.match(/\d+(?:\.\d+)?|[+\-*/]/g)||[]; if(!tokens.length)throw new Error('empty');
  const values=[],ops=[]; const prec={'+':1,'-':1,'*':2,'/':2};
  const apply=()=>{ const op=ops.pop(),b=values.pop(),a=values.pop(); if(a===undefined||b===undefined)throw new Error('bad'); let v=0; if(op==='+')v=a+b; else if(op==='-')v=a-b; else if(op==='*')v=a*b; else { if(b===0)throw new Error('zero'); v=a/b; } values.push(v); };
  let expectNumber=true;
  for(const token of tokens){
    if(/^\d/.test(token)){ if(!expectNumber)throw new Error('bad'); values.push(Number(token)); expectNumber=false; }
    else { if(expectNumber)throw new Error('bad'); while(ops.length&&prec[ops[ops.length-1]]>=prec[token])apply(); ops.push(token); expectNumber=true; }
  }
  if(expectNumber)throw new Error('bad'); while(ops.length)apply(); const out=values[0]; if(!Number.isFinite(out)||out<0)throw new Error('bad'); return Math.round((out+Number.EPSILON)*100)/100;
}
function renderCalculator(){
  const expr=calcExpression||'0'; $('calcExpression').textContent=prettyCalcExpression(expr);
  try{ const v=evaluateExpression(calcExpression||'0'); $('calcResult').textContent=money(v); $('calcResult').classList.remove('calc-error'); }
  catch{ $('calcResult').textContent='—'; $('calcResult').classList.add('calc-error'); }
}
function openCalculator(){
  const current=String($('amountInput').value||'').trim(); calcExpression=currentCalcExpression||current||''; show($('calculatorScreen')); renderCalculator();
}
function closeCalculator(){ hide($('calculatorScreen')); }
function calculatorKey(key){
  if(key==='clear'){ calcExpression=''; renderCalculator(); return; }
  if(key==='back'){ calcExpression=calcExpression.slice(0,-1); renderCalculator(); return; }
  if(key==='equals'){ try{ const v=evaluateExpression(calcExpression); calcExpression=String(v); renderCalculator(); }catch{toast('算式還沒完成');} return; }
  const ops='+-×÷'; if(ops.includes(key)){ if(!calcExpression)return; if(/[+\-×÷]$/.test(calcExpression))calcExpression=calcExpression.slice(0,-1)+key; else calcExpression+=key; }
  else if(key==='.'){
    const last=(calcExpression.split(/[+\-×÷]/).pop()||''); if(last.includes('.'))return; calcExpression+=(last?'':'0')+'.';
  }else calcExpression+=key;
  renderCalculator();
}
function applyCalculator(){
  try{ const v=evaluateExpression(calcExpression); if(!(v>0)){toast('金額需大於 0');return;} $('amountInput').value=String(v); currentCalcExpression=calcExpression; const pretty=prettyCalcExpression(calcExpression); if(/[+\-×÷]/.test(calcExpression)){ $('amountCalcHint').textContent=`${pretty} = ${money(v)}`; show($('amountCalcHint')); } else hide($('amountCalcHint')); closeCalculator(); }
  catch{toast('請先完成算式');}
}

function setEditType(type){ editType=type; $('expenseTypeBtn').classList.toggle('active',type==='expense'); $('incomeTypeBtn').classList.toggle('active',type==='income'); $('investmentTypeBtn').classList.toggle('active',type==='investment'); $('expenseFields').classList.toggle('hidden',type!=='expense'); $('incomeFields').classList.toggle('hidden',type!=='income'); $('investmentFields').classList.toggle('hidden',type!=='investment'); updateEditorRecurringVisibility(); }
function setPayment(p){ selectedPayment=p; document.querySelectorAll('[data-payment]').forEach(b=>b.classList.toggle('active',b.dataset.payment===p)); }
function updateEditorRecurringVisibility(){
  const wrap=$('editorRecurringWrap'); if(!wrap)return;
  const allowed=!editingId; wrap.classList.toggle('hidden',!allowed);
  if(!allowed){ $('editorRecurringInput').checked=false; $('editorRecurringFields').classList.add('hidden'); }
}
function toggleEditorRecurringFields(){ const on=$('editorRecurringInput').checked; $('editorRecurringFields').classList.toggle('hidden',!on); updateEditorRecurringHint(); }
function parseMonthlyDays(value,fallback=1){
  const vals=String(value||'').split(/[,，、\s]+/).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=31);
  return [...new Set(vals.length?vals:[Number(fallback)||1])].sort((a,b)=>a-b);
}
function normalizeMonthlyDayArray(days,fallback=1){
  const vals=(Array.isArray(days)?days:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=31);
  return [...new Set(vals.length?vals:[Number(fallback)||1])].sort((a,b)=>a-b);
}
function renderMonthlyDayChips(containerId,days,onRemove){
  const box=$(containerId); if(!box)return; box.innerHTML='';
  normalizeMonthlyDayArray(days).forEach(day=>{ const chip=document.createElement('button'); chip.type='button'; chip.className='day-chip'; chip.innerHTML=`<span>${day} 日</span><b aria-hidden="true">×</b>`; chip.setAttribute('aria-label',`移除 ${day} 日`); chip.onclick=()=>onRemove(day); box.appendChild(chip); });
}
function setEditorMonthlyDays(days){ editorMonthlyDays=normalizeMonthlyDayArray(days); renderMonthlyDayChips('editorRecurringMonthlyDayChips',editorMonthlyDays,day=>{ if(editorMonthlyDays.length<=1){toast('至少保留一個日期');return;} editorMonthlyDays=editorMonthlyDays.filter(x=>x!==day); setEditorMonthlyDays(editorMonthlyDays); updateEditorRecurringHint(); }); }
function setRecurringMonthlyDaysDraft(days){ recurringMonthlyDaysDraft=normalizeMonthlyDayArray(days); renderMonthlyDayChips('recurringMonthlyDayChips',recurringMonthlyDaysDraft,day=>{ if(recurringMonthlyDaysDraft.length<=1){toast('至少保留一個日期');return;} recurringMonthlyDaysDraft=recurringMonthlyDaysDraft.filter(x=>x!==day); setRecurringMonthlyDaysDraft(recurringMonthlyDaysDraft); }); }
function addMonthlyDayFromInput(inputId,current,setter){ const input=$(inputId); const raw=String(input?.value||'').trim(); if(!raw)return current; const day=Number(raw); if(!Number.isInteger(day)||day<1||day>31){toast('日期請輸入 1～31');return current;} const next=normalizeMonthlyDayArray([...current,day],day); setter(next); input.value=''; return next; }
function addEditorMonthlyDay(){ editorMonthlyDays=addMonthlyDayFromInput('editorRecurringMonthlyDayInput',editorMonthlyDays,setEditorMonthlyDays); updateEditorRecurringHint(); }
function addRecurringMonthlyDay(){ recurringMonthlyDaysDraft=addMonthlyDayFromInput('recurringMonthlyDayInput',recurringMonthlyDaysDraft,setRecurringMonthlyDaysDraft); }
function collectEditorMonthlyDays(fallback){ addEditorMonthlyDay(); return normalizeMonthlyDayArray(editorMonthlyDays,fallback); }
function collectRecurringMonthlyDays(fallback){ addRecurringMonthlyDay(); return normalizeMonthlyDayArray(recurringMonthlyDaysDraft,fallback); }
function updateEditorRecurringHint(){
  const start=$('dateInput').value; const freq=$('editorRecurringFrequency')?.value||'monthly'; if(!$('editorRecurringHint'))return;
  const monthly=$('editorRecurringMonthlyDaysFields'); if(monthly)monthly.classList.toggle('hidden',freq!=='monthly');
  const label={weekly:'每週',monthly:'每月',bimonthly:'每兩個月',yearly:'每年'}[freq]||'每月';
  const days=freq==='monthly'?`（${normalizeMonthlyDayArray(editorMonthlyDays,start?parseDateKey(start).getDate():1).join('、')} 日）`:'';
  $('editorRecurringHint').textContent=start?`從 ${start} 開始，${label}${days}建立；可設定結束日期。`:'上方日期就是週期開始日。';
}
function openEditor(txn=null,date=selectedDate,transcript=''){
  editingId=txn?.id||null; $('editorTitle').textContent=editingId?'編輯':'記一筆'; show($('editorScreen')); $('voiceResultCard').classList.toggle('hidden',!transcript); $('voiceTranscript').textContent=transcript||'';
  setEditType(txn?.type||'expense'); $('amountInput').value=txn?.pendingAmount?'':(txn?.amount||''); currentCalcExpression=''; hide($('amountCalcHint')); $('amountCalcHint').textContent=''; $('dateInput').value=txn?.date||date||dateKey(new Date()); updateEditorDateContext(); $('titleInput').value=txn?.title||''; $('noteInput').value=txn?.note||'';
  const baseDay=parseDateKey($('dateInput').value).getDate();
  $('editorRecurringInput').checked=false; $('editorRecurringFields').classList.add('hidden'); $('editorRecurringFrequency').value='monthly'; $('editorRecurringMonthlyDayInput').value=''; setEditorMonthlyDays([baseDay]); $('editorRecurringEndDate').value=''; $('editorPendingAmountInput').checked=false; updateEditorRecurringVisibility(); updateEditorRecurringHint();
  if((txn?.type||'expense')==='expense'){ selectedCategoryId=txn?.categoryId||'food'; ensureSelectedCategory(); renderCategoryPicker(); renderSubcategories(txn?.subcategory); setPayment(txn?.payment||'card'); }
  $('incomeCategoryInput').value=txn?.incomeCategory||'薪資'; $('investmentCategoryInput').value=txn?.investmentCategory||'股票／ETF';
}
function updateEditorDateContext(){ const v=$('dateInput').value; if(!v)return; const d=parseDateKey(v); $('editorDateContext').textContent=`記錄日期：${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日`; updateEditorRecurringHint(); }
function closeEditor(){ hide($('editorScreen')); editingId=null; }
async function saveTxn(){
  const amount=Number($('amountInput').value||0),date=$('dateInput').value||dateKey(new Date()),title=$('titleInput').value.trim(),wasEditing=!!editingId;
  const makeRecurring=!editingId&&$('editorRecurringInput').checked; const pending=makeRecurring&&$('editorPendingAmountInput').checked;
  if(!pending&&!(amount>0)){toast('請輸入金額');return;} if(makeRecurring&&!title){toast('週期紀錄請填寫內容名稱');return;}
  if(makeRecurring){
    const endDate=$('editorRecurringEndDate').value||''; if(endDate&&endDate<date){toast('結束日期不能早於開始日期');return;}
    const start=parseDateKey(date),frequency=$('editorRecurringFrequency').value;
    const r={id:uid(),type:editType,title,amount:pending?0:amount,pendingAmount:pending,frequency,monthlyDays:frequency==='monthly'?collectEditorMonthlyDays(start.getDate()):undefined,dayOfMonth:start.getDate(),dayOfWeek:start.getDay(),monthOfYear:start.getMonth()+1,dayOfYear:start.getDate(),startDate:date,endDate,skipDates:[],enabled:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    if(editType==='income')r.incomeCategory=$('incomeCategoryInput').value; else if(editType==='investment')r.investmentCategory=$('investmentCategoryInput').value; else{r.categoryId=selectedCategoryId;r.subcategory=$('subcategoryInput').value;r.payment=selectedPayment;}
    recurring.push(r); await processRecurringDue(false); await persistState(); selectedDate=date; viewMonth=startOfMonth(start); closeEditor(); renderAll(); toast(pending?'週期提醒已建立，屆期再填金額':editType==='investment'?'定期投資已建立':'週期紀錄已建立'); return;
  }
  const old=txns.find(t=>t.id===editingId); const base={id:editingId||uid(),type:editType,amount,date,title,note:$('noteInput').value.trim(),updatedAt:new Date().toISOString()};
  if(old?.recurringId)base.recurringId=old.recurringId; if(old?.recurringKey)base.recurringKey=old.recurringKey; if(old?.sourceRecurringPending)base.sourceRecurringPending=true;
  let rec=base; if(editType==='expense')rec={...base,categoryId:selectedCategoryId,subcategory:$('subcategoryInput').value,payment:selectedPayment}; if(editType==='income')rec={...base,incomeCategory:$('incomeCategoryInput').value}; if(editType==='investment')rec={...base,investmentCategory:$('investmentCategoryInput').value};
  rec.pendingAmount=false; rec.createdAt=old?.createdAt||new Date().toISOString(); if(editingId)txns=txns.map(t=>t.id===editingId?rec:t); else txns.push(rec); await persistState(); selectedDate=date; viewMonth=startOfMonth(parseDateKey(date)); closeEditor(); renderAll(); toast(wasEditing?'已更新':'已記錄');
}
function openTxnMenu(id){ actionTxnId=id; show($('txnMenuScreen')); }
function closeTxnMenu(){ hide($('txnMenuScreen')); actionTxnId=null; }
function openRecurringEditScope(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t)return;
  $('recurringEditScopeHint').textContent=`${t.title||'這筆週期紀錄'}：要只改這筆，還是從這筆開始套用到之後？`;
  hide($('txnMenuScreen')); show($('recurringEditScopeScreen'));
}
function closeRecurringEditScope(){ hide($('recurringEditScopeScreen')); actionTxnId=null; }
function editOccurrenceOnly(){ const t=txns.find(x=>x.id===actionTxnId); hide($('recurringEditScopeScreen')); actionTxnId=null; if(t)openEditor(t); }
function editRecurringFromOccurrence(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t?.recurringId)return closeRecurringEditScope();
  const occurrence=recurringOccurrenceDate(t),rid=t.recurringId; hide($('recurringEditScopeScreen')); actionTxnId=null;
  openRecurringEditor(rid,{splitSourceId:rid,effectiveFrom:occurrence});
}
function recurringOccurrenceDate(t){ const prefix=t?.recurringId?`${t.recurringId}:`:''; return t?.recurringKey?.startsWith(prefix)?t.recurringKey.slice(prefix.length):(t?.date||''); }
async function deleteTxn(){
  if(!actionTxnId)return; const t=txns.find(x=>x.id===actionTxnId); if(!t)return;
  if(t.recurringId){ hide($('txnMenuScreen')); $('recurringDeleteHint').textContent=`${t.title||'這筆紀錄'}：之前已經發生的週期紀錄都會保留。`; show($('recurringDeleteScreen')); return; }
  if(!confirm('確定刪除這筆紀錄？'))return; txns=txns.filter(x=>x.id!==actionTxnId); await persistState(); closeTxnMenu(); renderAll(); toast('已刪除');
}
function closeRecurringDelete(){ hide($('recurringDeleteScreen')); actionTxnId=null; }
async function deleteOccurrenceOnly(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t)return closeRecurringDelete(); const occurrence=recurringOccurrenceDate(t),r=recurring.find(x=>x.id===t.recurringId);
  if(r){ if(!Array.isArray(r.skipDates))r.skipDates=[]; if(occurrence&&!r.skipDates.includes(occurrence))r.skipDates.push(occurrence); }
  txns=txns.filter(x=>x.id!==t.id); await persistState(); closeRecurringDelete(); renderAll(); toast('只刪除這一筆，之後週期照常');
}
async function stopRecurringFromOccurrence(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t)return closeRecurringDelete(); const occurrence=recurringOccurrenceDate(t),r=recurring.find(x=>x.id===t.recurringId);
  if(r&&occurrence)r.cancelFromDate=occurrence;
  txns=txns.filter(x=>{ if(x.recurringId!==t.recurringId)return true; const od=recurringOccurrenceDate(x); return !occurrence||od<occurrence; });
  await persistState(); closeRecurringDelete(); renderAll(); toast('已從這一筆開始停止後續週期');
}
function openBudgetEditor(){ const box=$('budgetEditorList'); box.innerHTML=''; for(const item of budgetRows()){ const label=document.createElement('label'); label.textContent=`${item.icon} ${item.label}`; const input=document.createElement('input'); input.type='number';input.inputMode='numeric';input.min='0';input.step='100';input.dataset.budgetKey=item.key;input.value=budgetValue(item.key)||'';input.placeholder='未設定';box.append(label,input); } show($('budgetEditorScreen')); }
async function saveBudgetEditor(){ document.querySelectorAll('#budgetEditorList input[data-budget-key]').forEach(i=>{const v=Number(i.value||0);if(v>0)budgets[i.dataset.budgetKey]=v;else delete budgets[i.dataset.budgetKey];}); await persistState(); hide($('budgetEditorScreen')); renderAll(); toast('預算已儲存'); }

function chineseNumberToInt(s){
  if(/^\d+(?:\.\d+)?$/.test(s))return Number(s); const digit={'零':0,'〇':0,'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9}; const unit={'十':10,'百':100,'千':1000,'萬':10000}; let total=0,section=0,num=0;
  for(const ch of s){ if(ch in digit)num=digit[ch]; else if(ch in unit){ const u=unit[ch]; if(u===10000){ section=(section+num)*u; total+=section; section=0;num=0;}else{section+=(num||1)*u;num=0;} } } return total+section+num;
}
function extractAmount(text){
  const normalized=text.replace(/,/g,''); const patterns=[/(?:NT\$|NTD|\$)\s*(\d+(?:\.\d+)?)/i,/(\d+(?:\.\d+)?)\s*(?:元|塊|塊錢)/,/(\d{2,})/]; for(const p of patterns){const m=normalized.match(p);if(m)return Number(m[1]);}
  const cm=normalized.match(/([零〇一二兩三四五六七八九十百千萬]+)\s*(?:元|塊|塊錢)/); return cm?chineseNumberToInt(cm[1]):0;
}
function relativeDate(text){ const now=parseDateKey(selectedDate||dateKey(new Date())); if(/今天/.test(text))return dateKey(new Date()); if(/前天/.test(text))now.setDate(now.getDate()-2); else if(/昨天|昨日/.test(text))now.setDate(now.getDate()-1); const md=text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日號]?/); if(md)now.setMonth(Number(md[1])-1,Number(md[2])); return dateKey(now); }
function findMentionedCategory(text){ for(const c of categories){ if(text.includes(c.name))return {categoryId:c.id,subcategory:c.subs?.find(s=>text.includes(s))||c.subs?.[0]||'其他'}; for(const s of c.subs||[])if(text.includes(s))return {categoryId:c.id,subcategory:s}; } return null; }
function inferExpenseCategory(text,dateStr){
  const t=text.toLowerCase(); const direct=findMentionedCategory(text); if(direct)return direct;
  if(/同事|同仁|朋友|聚餐|請客|應酬|尾牙|春酒/.test(t))return {categoryId:'social',subcategory:/同事|同仁/.test(t)?'同事聚餐':'朋友聚餐／請客'};
  if(/停車|停車費/.test(t))return {categoryId:'transport',subcategory:'停車'}; if(/充電|加油|汽油/.test(t))return {categoryId:'transport',subcategory:'充電／加油'}; if(/捷運|公車|高鐵|台鐵|火車/.test(t))return {categoryId:'transport',subcategory:'大眾運輸'}; if(/計程車|uber|taxi/.test(t))return {categoryId:'transport',subcategory:'計程車'};
  if(/學費|補習|才藝|課程|小孩用品|女兒|孩子|小孩/.test(t)&&!/吃|餐|飯|壽司|火鍋|燒肉/.test(t))return {categoryId:'family',subcategory:/學費|補習|才藝|課程/.test(t)?'教育':'小孩用品'};
  if(/水費|電費|瓦斯/.test(t))return {categoryId:'home',subcategory:'水電瓦斯'}; if(/電話|網路|手機費/.test(t))return {categoryId:'home',subcategory:'電話網路'}; if(/全聯|家樂福|costco|好市多|日用品|衛生紙/.test(t))return {categoryId:'home',subcategory:'生活雜支'};
  if(/衣服|鞋|褲|外套|polo|服飾/.test(t))return {categoryId:'shopping',subcategory:'服飾'}; if(/iphone|ipad|電腦|耳機|家電|3c/.test(t))return {categoryId:'shopping',subcategory:'3C／家電'};
  if(/看診|掛號|醫院|診所|牙醫/.test(t))return {categoryId:'health',subcategory:'看診'}; if(/藥局|藥品|買藥/.test(t))return {categoryId:'health',subcategory:'藥品'};
  if(/旅館|飯店|住宿|旅遊|機票/.test(t))return {categoryId:'leisure',subcategory:'旅遊'}; if(/電影|netflix|disney|遊戲|娛樂/.test(t))return {categoryId:'leisure',subcategory:/netflix|disney/.test(t)?'訂閱服務':'娛樂'}; if(/保險|保費/.test(t))return {categoryId:'fixed',subcategory:'保險'};
  const food=/早餐|午餐|晚餐|便當|咖啡|飲料|吃|餐廳|壽司|牛肉麵|麵|飯|鼎泰豐|火鍋|燒肉|麥當勞|肯德基|星巴克/.test(t);
  if(food){ if(/家人|老婆|太太|女兒|小孩|孩子|全家|家庭/.test(t))return {categoryId:'food',subcategory:'家庭餐飲'}; const d=parseDateKey(dateStr),weekday=d.getDay()>=1&&d.getDay()<=5; if(weekday&&/早餐|午餐|便當|咖啡|飲料/.test(t))return {categoryId:'food',subcategory:'上班餐飲'}; return {categoryId:'food',subcategory:'家庭餐飲'}; }
  return {categoryId:'other',subcategory:'其他'};
}
function inferTitle(text,amount){ let s=text.replace(/今天|昨天|昨日|前天/g,'').replace(/\d{1,2}\s*月\s*\d{1,2}\s*[日號]?/g,'').replace(/刷卡|信用卡|apple\s*pay|line\s*pay|街口|悠遊付|現金/g,''); if(amount)s=s.replace(new RegExp(String(amount).replace('.','\\.')+'\\s*(元|塊|塊錢)?','g'),''); s=s.replace(/[零〇一二兩三四五六七八九十百千萬]+\s*(元|塊|塊錢)/g,'').replace(/\s+/g,' ').trim().replace(/^[，,。；;：:\-]+|[，,。；;：:\-]+$/g,''); return s||'未命名'; }
function extractVoiceAmount(segment){
  let s=String(segment||'').replace(/\d{1,2}\s*月\s*\d{1,2}\s*[日號]?/g,' ').replace(/\b00\d{2,3}[A-Za-z]?\b/g,' ');
  let m=s.match(/(?:NT\$|NTD|\$)\s*(\d+(?:\.\d+)?)/i); if(m)return Number(m[1]);
  m=s.match(/(\d+(?:\.\d+)?)\s*(?:元|塊|塊錢)/); if(m)return Number(m[1]);
  const cm=s.match(/([零〇一二兩三四五六七八九十百千萬]+)\s*(?:元|塊|塊錢)/); if(cm)return chineseNumberToInt(cm[1]);
  const nums=[...s.matchAll(/\d+(?:\.\d+)?/g)].map(x=>Number(x[0])).filter(Number.isFinite); return nums.length?nums[nums.length-1]:0;
}
function splitVoiceSegments(text){
  let s=String(text||'').trim();
  s=s.replace(/(加上|再加|外加|還有|以及|然後|另外)/g,'，');
  s=s.replace(/(\d+(?:\.\d+)?\s*(?:元|塊|塊錢)?)\s*加(?!碼|油)(?=[^，。；;]{0,12}\d)/g,'$1，');
  return s.split(/[，,、；;。\n]+/).map(x=>x.trim()).filter(Boolean);
}
function inferVoiceItemType(segment,fullText){
  const seg=segment.toLowerCase(),full=fullText.toLowerCase();
  if(/投資|買進|加碼|股票|etf|基金|債券|0050|009\d+|台積電|藥華藥/.test(seg)&&!/股息|配息/.test(seg))return 'investment';
  if(/收入|薪水|薪資|獎金|股息|配息|退款|退費|入帳/.test(seg)&&!/支出|花|買|吃|停車/.test(seg))return 'income';
  const obviousExpense=/午餐|早餐|晚餐|飲料|咖啡|吃|餐|停車|加油|充電|買衣|購物|電費|水費|瓦斯|保險|看診|計程車|捷運|公車/.test(seg);
  if(obviousExpense)return 'expense';
  const fullInvestment=/投資|定期定額|買進|股票|etf|基金|債券/.test(full)&&!/股息|配息/.test(full);
  const fullIncome=/收入|薪水|薪資|獎金|股息|配息|退款|退費/.test(full)&&!/支出|午餐|停車|吃/.test(full);
  if(fullInvestment)return 'investment'; if(fullIncome)return 'income'; return 'expense';
}
function cleanVoiceItemTitle(segment,amount,type){
  let t=inferTitle(segment,amount).replace(/^(投資|收入|支出|買進|買了|加碼)\s*/,'').trim();
  if(type==='expense')t=t.replace(/^(花了|花)\s*/,'').trim();
  return t||'未命名';
}
function parseVoiceItems(text){
  const date=relativeDate(text),globalPayment=/現金/.test(text)?'cash':'card'; const raw=[];
  for(const segment of splitVoiceSegments(text)){
    const amount=extractVoiceAmount(segment); if(!(amount>0))continue;
    const type=inferVoiceItemType(segment,text),title=cleanVoiceItemTitle(segment,amount,type);
    if(type==='investment'){
      let investmentCategory='股票／ETF'; if(/基金/.test(segment))investmentCategory='基金'; else if(/債券/.test(segment))investmentCategory='債券';
      raw.push({type,amount,date,title,investmentCategory,components:[{title,amount}]}); continue;
    }
    if(type==='income'){
      let incomeCategory='其他收入'; if(/薪水|薪資/.test(segment))incomeCategory='薪資'; else if(/獎金/.test(segment))incomeCategory='獎金'; else if(/股息|配息/.test(segment))incomeCategory='股息'; else if(/退款|退費/.test(segment))incomeCategory='退款';
      raw.push({type,amount,date,title,incomeCategory,components:[{title,amount}]}); continue;
    }
    const inferred=inferExpenseCategory(segment,date); raw.push({type:'expense',amount,date,title,payment:globalPayment,...inferred,components:[{title,amount}]});
  }
  if(!raw.length){ const fallback=parseVoiceTextLegacy(text); return fallback.amount?[fallback]:[]; }
  const grouped=[]; const map=new Map();
  for(const item of raw){
    const key=item.type==='expense'?`expense|${item.date}|${item.categoryId}|${item.subcategory}|${item.payment}`:item.type==='income'?`income|${item.date}|${item.incomeCategory}`:`investment|${item.date}|${item.title}|${grouped.length}`;
    if(item.type==='investment'||!map.has(key)){ const copy={...item,components:[...(item.components||[])]}; grouped.push(copy); if(item.type!=='investment')map.set(key,copy); }
    else{
      const g=map.get(key); g.amount+=item.amount; g.components.push(...(item.components||[])); const titles=[...new Set(g.components.map(c=>c.title).filter(x=>x&&x!=='未命名'))]; g.title=titles.length?titles.join('＋'):g.title;
    }
  }
  return grouped;
}
function parseVoiceTextLegacy(text){
  const date=relativeDate(text),amount=extractAmount(text); const isInvestment=/投資|買進|加碼|股票|etf|基金|債券|0050|009\d+|台積電|藥華藥/.test(text.toLowerCase())&&!/股息|配息/.test(text.toLowerCase());
  if(isInvestment){ let investmentCategory='股票／ETF'; if(/基金/.test(text))investmentCategory='基金'; else if(/債券/.test(text))investmentCategory='債券'; return {type:'investment',amount,date,title:inferTitle(text,amount),investmentCategory,components:[{title:inferTitle(text,amount),amount}]}; }
  const income=/收入|薪水|薪資|獎金|股息|配息|退款|退費|入帳/.test(text)&&!/支出|花|買|吃|停車/.test(text); if(income){ let incomeCategory='其他收入'; if(/薪水|薪資/.test(text))incomeCategory='薪資'; else if(/獎金/.test(text))incomeCategory='獎金'; else if(/股息|配息/.test(text))incomeCategory='股息'; else if(/退款|退費/.test(text))incomeCategory='退款'; return {type:'income',amount,date,title:inferTitle(text,amount),incomeCategory,components:[{title:inferTitle(text,amount),amount}]}; }
  const inferred=inferExpenseCategory(text,date),payment=/現金/.test(text)?'cash':'card',title=inferTitle(text,amount); return {type:'expense',amount,date,title,payment,...inferred,components:[{title,amount}]};
}
function componentExpression(item){ const parts=(item.components||[]).map(c=>Number(c.amount||0)).filter(n=>n>0); return parts.length>1?parts.join(' + '):''; }
function applyParsedVoice(parsed,transcript){
  closeVoiceSheet(false); openEditor(null,parsed.date,transcript); setEditType(parsed.type); $('amountInput').value=parsed.amount||''; $('dateInput').value=parsed.date; $('titleInput').value=parsed.title||'';
  const expr=componentExpression(parsed); currentCalcExpression=expr; if(expr){$('amountCalcHint').textContent=`${expr} = ${money(parsed.amount)}`;show($('amountCalcHint'));}
  if(parsed.type==='expense'){selectedCategoryId=parsed.categoryId;ensureSelectedCategory();renderCategoryPicker();renderSubcategories(parsed.subcategory);$('subcategoryInput').value=parsed.subcategory;setPayment(parsed.payment);} else if(parsed.type==='income')$('incomeCategoryInput').value=parsed.incomeCategory||'其他收入'; else $('investmentCategoryInput').value=parsed.investmentCategory||'股票／ETF'; if(!parsed.amount)toast('我沒抓到金額，請補一下',2600);
}
function voiceDraftMeta(item){
  if(item.type==='income')return `收入 · ${item.incomeCategory||'其他收入'}`; if(item.type==='investment')return `投資 · ${item.investmentCategory||'股票／ETF'}`; const c=categoryById(item.categoryId); return `${c?.icon||'📌'} ${c?.name||'其他'} · ${item.subcategory||'其他'} · ${item.payment==='cash'?'現金':'信用卡'}`;
}
function renderVoiceDrafts(){
  const box=$('voiceDraftList'); box.innerHTML=''; $('voiceDraftCount').textContent=`${voiceDraftItems.length} 筆`; $('voiceDraftTotal').textContent=`合計 ${money(sum(voiceDraftItems))}`;
  voiceDraftItems.forEach((item,index)=>{ const row=document.createElement('div'); row.className='voice-draft-row'; const expr=componentExpression(item); row.innerHTML=`<div class="voice-draft-main"><div class="voice-draft-title">${escapeHtml(item.title||'未命名')}</div><div class="voice-draft-meta">${escapeHtml(voiceDraftMeta(item))}</div>${expr?`<div class="voice-draft-calc">${escapeHtml(expr)} = ${money(item.amount)}</div>`:''}</div><strong class="voice-draft-amount ${item.type}">${money(item.amount)}</strong><button type="button" class="voice-draft-edit" data-voice-edit="${index}" aria-label="編輯這筆">✎</button><button type="button" class="voice-draft-remove" data-voice-remove="${index}" aria-label="移除這筆">×</button>`; box.appendChild(row); });
  $('saveVoiceDraftBtn').disabled=!voiceDraftItems.length;
}
function openVoiceDraftItemEditor(index){
  const item=voiceDraftItems[index]; if(!item)return; voiceDraftEditingIndex=index; $('voiceDraftEditTitle').value=item.title||''; $('voiceDraftEditAmount').value=item.amount||''; $('voiceDraftEditDate').value=item.date||selectedDate; $('voiceDraftEditExpenseFields').classList.toggle('hidden',item.type!=='expense'); $('voiceDraftEditIncomeFields').classList.toggle('hidden',item.type!=='income'); $('voiceDraftEditInvestmentFields').classList.toggle('hidden',item.type!=='investment');
  if(item.type==='expense'){const sel=$('voiceDraftEditCategory');sel.innerHTML='';visibleCategories().forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=`${c.icon} ${c.name}`;sel.appendChild(o);});sel.value=item.categoryId||'other';renderVoiceDraftEditSubcategories(item.subcategory);$('voiceDraftEditPayment').value=item.payment||'card';}
  if(item.type==='income')$('voiceDraftEditIncomeCategory').value=item.incomeCategory||'其他收入'; if(item.type==='investment')$('voiceDraftEditInvestmentCategory').value=item.investmentCategory||'股票／ETF'; show($('voiceDraftEditScreen'));
}
function renderVoiceDraftEditSubcategories(preferred){const c=categoryById($('voiceDraftEditCategory').value),sel=$('voiceDraftEditSubcategory');sel.innerHTML='';(c.subs||['其他']).forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;sel.appendChild(o);});if(preferred&&[...sel.options].some(o=>o.value===preferred))sel.value=preferred;}
function saveVoiceDraftItemEdit(){const item=voiceDraftItems[voiceDraftEditingIndex];if(!item)return;const amount=Number($('voiceDraftEditAmount').value||0),title=$('voiceDraftEditTitle').value.trim(),date=$('voiceDraftEditDate').value;if(!(amount>0)||!date){toast('請填金額與日期');return;}item.amount=amount;item.title=title||'未命名';item.date=date;item.components=[{title:item.title,amount}];if(item.type==='expense'){item.categoryId=$('voiceDraftEditCategory').value;item.subcategory=$('voiceDraftEditSubcategory').value;item.payment=$('voiceDraftEditPayment').value;}else if(item.type==='income')item.incomeCategory=$('voiceDraftEditIncomeCategory').value;else item.investmentCategory=$('voiceDraftEditInvestmentCategory').value;hide($('voiceDraftEditScreen'));renderVoiceDrafts();}
function openVoiceDrafts(items){ closeVoiceSheet(false); voiceDraftItems=items; renderVoiceDrafts(); show($('voiceDraftScreen')); }
function closeVoiceDrafts(){ hide($('voiceDraftScreen')); voiceDraftItems=[]; }
async function saveVoiceDrafts(){
  if(!voiceDraftItems.length)return; const now=new Date().toISOString();
  for(const item of voiceDraftItems){ const base={id:uid(),type:item.type,amount:Number(item.amount||0),date:item.date,title:item.title||'未命名',note:'',createdAt:now,updatedAt:now,pendingAmount:false}; let rec=base; if(item.type==='expense')rec={...base,categoryId:item.categoryId||'other',subcategory:item.subcategory||'其他',payment:item.payment||'card'}; else if(item.type==='income')rec={...base,incomeCategory:item.incomeCategory||'其他收入'}; else rec={...base,investmentCategory:item.investmentCategory||'股票／ETF'}; txns.push(rec); }
  const first=voiceDraftItems[0]; await persistState(); selectedDate=first.date; viewMonth=startOfMonth(parseDateKey(first.date)); const count=voiceDraftItems.length; closeVoiceDrafts(); renderAll(); toast(`已一次記錄 ${count} 筆`);
}

function speechSupported(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); }
function openVoiceSheet(){
  show($('voiceSheet')); const base=parseDateKey(selectedDate); $('voiceBaseDateText').textContent=`未指定日期時，會記在 ${base.getMonth()+1}/${base.getDate()}。`;  voiceAccumulated='';voiceInterim=''; $('liveTranscript').textContent='尚未收到語音…'; $('voiceFallbackInput').value=''; hide($('voiceFallbackInput')); hide($('voiceFallbackBtn')); $('voiceStatus').textContent='正在聽你說'; $('voiceHint').textContent='你可以慢慢說；在你按「完成」之前，不會新增任何紀錄。';
  if(speechSupported())startVoiceSession(); else{ $('voiceStatus').textContent='請用 iPhone 鍵盤麥克風'; $('voiceHint').textContent='這個環境不能直接持續收音，點下面輸入框後用鍵盤麥克風說完，再按完成。'; show($('voiceFallbackInput')); $('voiceFallbackInput').focus(); }
}
function startVoiceSession(){
  voiceSessionActive=true; const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR)return; recognition=new SR(); recognition.lang='zh-TW'; recognition.interimResults=true; recognition.continuous=true; recognition.maxAlternatives=1; $('voiceOrb').classList.add('listening');
  recognition.onresult=e=>{ let finalChunk='';voiceInterim=''; for(let i=e.resultIndex;i<e.results.length;i++){const s=e.results[i][0].transcript;if(e.results[i].isFinal)finalChunk+=s;else voiceInterim+=s;} if(finalChunk)voiceAccumulated+=(voiceAccumulated?' ':'')+finalChunk.trim(); $('liveTranscript').textContent=(voiceAccumulated+(voiceInterim?' '+voiceInterim:'')).trim()||'尚未收到語音…'; };
  recognition.onerror=e=>{ console.warn('speech',e.error); if(['not-allowed','service-not-allowed'].includes(e.error)){ voiceSessionActive=false;$('voiceOrb').classList.remove('listening');show($('voiceFallbackInput'));$('voiceFallbackInput').focus();$('voiceStatus').textContent='改用 iPhone 鍵盤麥克風'; } };
  recognition.onend=()=>{ $('voiceOrb').classList.remove('listening'); if(voiceSessionActive){ setTimeout(()=>{ try{recognition.start();$('voiceOrb').classList.add('listening');}catch{} },220); } };
  try{recognition.start();}catch{ show($('voiceFallbackInput')); }
}
function stopVoiceSession(){ voiceSessionActive=false; try{recognition?.stop?.();}catch{} try{recognition?.abort?.();}catch{} recognition=null; $('voiceOrb').classList.remove('listening'); }
function closeVoiceSheet(clear=true){ stopVoiceSession(); hide($('voiceSheet')); if(clear){voiceAccumulated='';voiceInterim='';} }
function finishVoice(){
  stopVoiceSession(); const typed=$('voiceFallbackInput').value.trim(); const text=(typed||`${voiceAccumulated} ${voiceInterim}`).trim(); if(!text){toast('還沒有收到內容');return;} const items=parseVoiceItems(text); if(!items.length){toast('我沒抓到金額，請再說一次或改用手動輸入',2800);return;} if(items.length===1)applyParsedVoice(items[0],text); else openVoiceDrafts(items);
}

function recurringList(){ return recurring; }
function renderRecurringCount(){ const today=dateKey(new Date()); const n=recurring.filter(r=>r.enabled!==false&&(!r.cancelFromDate||r.cancelFromDate>today)).length; if($('recurringCountText'))$('recurringCountText').textContent=`${n} 個啟用中`; }
function recurrenceMatches(r,d){
  const key=dateKey(d); if(key<r.startDate)return false; if(r.endDate&&key>r.endDate)return false; if(r.cancelFromDate&&key>=r.cancelFromDate)return false; if(Array.isArray(r.skipDates)&&r.skipDates.includes(key))return false;
  const start=parseDateKey(r.startDate);
  if(r.frequency==='weekly')return d.getDay()===Number(r.dayOfWeek??start.getDay());
  if(r.frequency==='yearly'){ if(d.getMonth()+1!==Number(r.monthOfYear||start.getMonth()+1))return false; const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(); return d.getDate()===Math.min(Number(r.dayOfYear||start.getDate()),last); }
  const monthDiff=(d.getFullYear()-start.getFullYear())*12+(d.getMonth()-start.getMonth()); if(r.frequency==='bimonthly'&&monthDiff%2!==0)return false;
  const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  if(r.frequency==='monthly'){ const days=parseMonthlyDays((r.monthlyDays||[]).join(','),r.dayOfMonth||start.getDate()).map(x=>Math.min(x,last)); return days.includes(d.getDate()); }
  return d.getDate()===Math.min(Number(r.dayOfMonth||start.getDate()),last);
}
function plannedOccurrenceFromRule(r,dk){
  const pending=!!r.pendingAmount;
  const base={id:`planned:${r.id}:${dk}`,planned:true,type:r.type,amount:pending?0:Number(r.amount||0),pendingAmount:pending,date:dk,title:r.title,recurringId:r.id,recurringKey:`${r.id}:${dk}`};
  if(r.type==='income')return {...base,incomeCategory:r.incomeCategory||'其他收入'};
  if(r.type==='investment')return {...base,investmentCategory:r.investmentCategory||'股票／ETF'};
  return {...base,categoryId:r.categoryId||'other',subcategory:r.subcategory||'其他',payment:r.payment||'card'};
}
function projectedOccurrencesForDate(dateStr){
  const today=dateKey(new Date()); if(!dateStr||dateStr<=today)return [];
  const d=parseDateKey(dateStr), existing=new Set(txns.filter(t=>t.date===dateStr&&t.recurringKey).map(t=>t.recurringKey));
  return recurring.filter(r=>r.enabled!==false&&recurrenceMatches(r,d)).map(r=>plannedOccurrenceFromRule(r,dateStr)).filter(t=>!existing.has(t.recurringKey));
}
async function processRecurringDue(shouldPersist=true){
  if(!recurring.length)return 0; const today=parseDateKey(dateKey(new Date())); let added=0; const existing=new Set(txns.map(t=>t.recurringKey).filter(Boolean));
  for(const r of recurring.filter(x=>x.enabled!==false)){
    let d=parseDateKey(r.startDate||dateKey(new Date())); if(d>today)continue; const maxDays=3660; let guard=0;
    for(;d<=today&&guard<maxDays;d.setDate(d.getDate()+1),guard++){
      if(!recurrenceMatches(r,d))continue; const dk=dateKey(d),rk=`${r.id}:${dk}`; if(existing.has(rk))continue;
      const pending=!!r.pendingAmount; const base={id:uid(),type:r.type,amount:pending?0:Number(r.amount||0),pendingAmount:pending,sourceRecurringPending:pending,date:dk,title:r.title,note:pending?'週期提醒・待填金額':'週期紀錄自動補登',recurringId:r.id,recurringKey:rk,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      let rec=base; if(r.type==='income')rec={...base,incomeCategory:r.incomeCategory||'其他收入'}; else if(r.type==='investment')rec={...base,investmentCategory:r.investmentCategory||'股票／ETF'}; else rec={...base,categoryId:r.categoryId||'other',subcategory:r.subcategory||'其他',payment:r.payment||'card'};
      txns.push(rec); existing.add(rk); added++;
    }
  }
  if(added&&shouldPersist)await persistState(); return added;
}
function recurringSummary(r){
  if(r.frequency==='weekly')return `每週${['日','一','二','三','四','五','六'][Number(r.dayOfWeek||0)]}`;
  if(r.frequency==='bimonthly')return `每兩個月 ${r.dayOfMonth} 日`;
  if(r.frequency==='yearly')return `每年 ${r.monthOfYear}/${r.dayOfYear}`;
  const days=parseMonthlyDays((r.monthlyDays||[]).join(','),r.dayOfMonth||1); return `每月 ${days.join('、')} 日`;
}
function renderRecurringManager(){
  const box=$('recurringManagerList'); if(!box)return; box.innerHTML=''; $('recurringEmpty').classList.toggle('hidden',recurring.length>0);
  recurring.forEach(r=>{ const row=document.createElement('div'); row.className='setting-card';
    const meta=r.type==='income'?(r.incomeCategory||'其他收入'):r.type==='investment'?`${r.investmentCategory||'股票／ETF'} · 不列入支出`:`${categoryById(r.categoryId).name} · ${r.subcategory||'其他'} · ${r.payment==='cash'?'現金':'信用卡'}`;
    const range=`${r.startDate} 起${r.endDate?` ～ ${r.endDate}`:' ～ 持續'}${r.cancelFromDate?` · ${r.cancelFromDate} 起已停止`:''}`;
    const icon=r.pendingAmount?'🔔':r.type==='income'?'💰':r.type==='investment'?'📈':'🧾';
    row.innerHTML=`<div class="section-head"><div><h3>${icon} ${escapeHtml(r.title)}</h3><p>${escapeHtml(recurringSummary(r))} · ${escapeHtml(range)}<br>${escapeHtml(meta)}</p></div><strong>${r.pendingAmount?'待填':money(r.amount)}</strong></div><div class="action-row"><button data-toggle class="secondary">${r.enabled===false?'啟用':'暫停'}</button><button data-edit class="secondary">編輯</button><button data-delete class="danger">刪除</button></div>`;
    row.querySelector('[data-toggle]').onclick=async()=>{r.enabled=r.enabled===false?true:false;await persistState();renderRecurringManager();renderRecurringCount();};
    row.querySelector('[data-edit]').onclick=()=>openRecurringEditor(r.id);
    row.querySelector('[data-delete]').onclick=()=>deleteRecurringRule(r.id);
    box.appendChild(row);
  }); renderRecurringCount();
}
async function deleteRecurringRule(id){
  const rule=recurring.find(x=>x.id===id);
  if(!rule)return;
  const ok=confirm(`刪除「${rule.title}」這個週期紀錄？

已經建立的歷史收支會保留，只是之後不再自動產生。`);
  if(!ok)return;
  recurring=recurring.filter(x=>x.id!==id);
  await persistState();
  renderRecurringManager();
  renderRecurringCount();
  renderAll();
  toast('已刪除週期紀錄');
}
function setRecurringType(type){
  recurringType=type; $('recurringExpenseTypeBtn').classList.toggle('active',type==='expense'); $('recurringIncomeTypeBtn').classList.toggle('active',type==='income'); $('recurringInvestmentTypeBtn').classList.toggle('active',type==='investment');
  $('recurringExpenseFields').classList.toggle('hidden',type!=='expense'); $('recurringIncomeFields').classList.toggle('hidden',type!=='income'); $('recurringInvestmentFields').classList.toggle('hidden',type!=='investment');
}
function setRecurringPayment(p){ recurringPayment=p; document.querySelectorAll('[data-recurring-payment]').forEach(b=>b.classList.toggle('active',b.dataset.recurringPayment===p)); }
function renderRecurringCategoryOptions(preferredId){ const sel=$('recurringCategoryInput');sel.innerHTML='';visibleCategories().forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=`${c.icon} ${c.name}`;sel.appendChild(o);});sel.value=preferredId&&visibleCategories().some(c=>c.id===preferredId)?preferredId:(visibleCategories()[0]?.id||'other');renderRecurringSubcategories(); }
function renderRecurringSubcategories(preferred){ const c=categoryById($('recurringCategoryInput').value),sel=$('recurringSubcategoryInput');sel.innerHTML='';(c.subs||['其他']).forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;sel.appendChild(o);});if(preferred&&[...sel.options].some(o=>o.value===preferred))sel.value=preferred; }
function updateRecurringFrequencyFields(){ const f=$('recurringFrequencyInput').value; $('recurringMonthlyFields').classList.toggle('hidden',f!=='monthly'); $('recurringBiMonthlyFields').classList.toggle('hidden',f!=='bimonthly'); $('recurringWeeklyFields').classList.toggle('hidden',f!=='weekly'); $('recurringYearlyFields').classList.toggle('hidden',f!=='yearly'); }
function openRecurringManager(){ renderRecurringManager();show($('recurringManagerScreen')); }
function openRecurringEditor(id=null,opts={}){
  recurringEditingId=id; recurringSplitSourceId=opts.splitSourceId||null; recurringSplitEffectiveDate=opts.effectiveFrom||'';
  const r=id?recurring.find(x=>x.id===id):null; $('recurringEditorTitle').textContent=recurringSplitEffectiveDate?`從 ${recurringSplitEffectiveDate} 起修改週期`:r?'編輯週期紀錄':'新增週期紀錄'; setRecurringType(r?.type||'expense'); $('recurringTitleInput').value=r?.title||''; $('recurringAmountInput').value=r?.pendingAmount?'':(r?.amount||''); $('recurringPendingAmountInput').checked=!!r?.pendingAmount; $('recurringFrequencyInput').value=r?.frequency||'monthly'; $('recurringMonthlyDayInput').value=''; setRecurringMonthlyDaysDraft(r?.monthlyDays||[r?.dayOfMonth||5]); $('recurringDayOfMonthInput').value=r?.dayOfMonth||5; $('recurringDayOfWeekInput').value=String(r?.dayOfWeek??1); $('recurringMonthOfYearInput').value=r?.monthOfYear||1; $('recurringDayOfYearInput').value=r?.dayOfYear||1; $('recurringStartDateInput').value=recurringSplitEffectiveDate||r?.startDate||dateKey(new Date()); $('recurringStartDateInput').disabled=!!recurringSplitEffectiveDate; $('recurringEndDateInput').value=r?.endDate||''; $('recurringIncomeCategoryInput').value=r?.incomeCategory||'薪資'; $('recurringInvestmentCategoryInput').value=r?.investmentCategory||'股票／ETF'; $('recurringEnabledInput').checked=r?.enabled!==false; renderRecurringCategoryOptions(r?.categoryId); if(r?.subcategory)renderRecurringSubcategories(r.subcategory); setRecurringPayment(r?.payment||'card'); updateRecurringFrequencyFields(); show($('recurringEditorScreen'));
}
async function saveRecurring(){
  const title=$('recurringTitleInput').value.trim(),amount=Number($('recurringAmountInput').value||0),pending=$('recurringPendingAmountInput').checked,startDate=$('recurringStartDateInput').value,endDate=$('recurringEndDateInput').value||'',frequency=$('recurringFrequencyInput').value;
  if(!title||!startDate||(!pending&&!(amount>0))){toast(pending?'請填名稱與開始日期':'請填名稱、金額與開始日期');return;} if(endDate&&endDate<startDate){toast('結束日期不能早於開始日期');return;}
  const start=parseDateKey(startDate),old=recurring.find(x=>x.id===recurringEditingId);
  const splitMode=!!recurringSplitSourceId&&!!recurringSplitEffectiveDate;
  const r={id:splitMode?uid():(recurringEditingId||uid()),type:recurringType,title,amount:pending?0:amount,pendingAmount:pending,frequency,monthlyDays:frequency==='monthly'?collectRecurringMonthlyDays(start.getDate()):(old?.monthlyDays||undefined),dayOfMonth:Number($('recurringDayOfMonthInput').value||start.getDate()),dayOfWeek:Number($('recurringDayOfWeekInput').value||start.getDay()),monthOfYear:Number($('recurringMonthOfYearInput').value||start.getMonth()+1),dayOfYear:Number($('recurringDayOfYearInput').value||start.getDate()),startDate,endDate,skipDates:splitMode?[]:(Array.isArray(old?.skipDates)?old.skipDates:[]),cancelFromDate:splitMode?'':(old?.cancelFromDate||''),enabled:$('recurringEnabledInput').checked,updatedAt:new Date().toISOString()};
  if(recurringType==='income')r.incomeCategory=$('recurringIncomeCategoryInput').value; else if(recurringType==='investment')r.investmentCategory=$('recurringInvestmentCategoryInput').value; else{r.categoryId=$('recurringCategoryInput').value;r.subcategory=$('recurringSubcategoryInput').value;r.payment=recurringPayment;}
  r.createdAt=splitMode?new Date().toISOString():(old?.createdAt||new Date().toISOString());
  if(splitMode){
    const source=recurring.find(x=>x.id===recurringSplitSourceId);
    if(source){source.cancelFromDate=recurringSplitEffectiveDate;source.updatedAt=new Date().toISOString();}
    txns=txns.filter(x=>{if(x.recurringId!==recurringSplitSourceId)return true;const od=recurringOccurrenceDate(x);return !od||od<recurringSplitEffectiveDate;});
    recurring.push(r);
  }else if(old)recurring=recurring.map(x=>x.id===r.id?r:x);else recurring.push(r);
  recurringSplitSourceId=null;recurringSplitEffectiveDate='';$('recurringStartDateInput').disabled=false;
  await processRecurringDue(false);await persistState();hide($('recurringEditorScreen'));renderRecurringManager();renderAll();toast(splitMode?'已從這一筆開始套用新的週期設定':pending?'週期提醒已儲存':recurringType==='investment'?'定期投資已儲存':'週期紀錄已儲存');
}

function renderQuickTemplateManager(){
  const box=$('quickTemplateManagerList'); if(!box)return; box.innerHTML='';
  quickTemplates.forEach((q,i)=>{const row=document.createElement('div');row.className='quick-template-manage-row';const meta=q.type==='expense'?`${categoryById(q.categoryId).name} · ${q.subcategory||'其他'} · ${q.payment==='cash'?'現金':'信用卡'}`:q.type==='income'?`收入 · ${q.incomeCategory||'其他收入'}`:`投資 · ${q.investmentCategory||'股票／ETF'}`;row.innerHTML=`<div class="quick-template-manage-icon">${escapeHtml(q.icon||'⚡')}</div><div class="quick-template-manage-main"><strong>${escapeHtml(q.name)}</strong><span>${escapeHtml(meta)}${Number(q.amount)>0?` · ${money(q.amount)}`:' · 每次補金額'}</span></div><div class="category-actions"><button data-up title="往上">↑</button><button data-down title="往下">↓</button><button data-edit title="編輯">✎</button><button data-delete title="刪除">×</button></div>`;row.querySelector('[data-up]').disabled=i===0;row.querySelector('[data-down]').disabled=i===quickTemplates.length-1;row.querySelector('[data-up]').onclick=()=>moveQuickTemplate(i,-1);row.querySelector('[data-down]').onclick=()=>moveQuickTemplate(i,1);row.querySelector('[data-edit]').onclick=()=>openQuickTemplateEditor(q.id);row.querySelector('[data-delete]').onclick=()=>deleteQuickTemplate(q.id);box.appendChild(row);});
  if(!quickTemplates.length)box.innerHTML='<div class="empty-mini">尚未建立快速模板。</div>';
}
async function moveQuickTemplate(i,delta){const j=i+delta;if(j<0||j>=quickTemplates.length)return;[quickTemplates[i],quickTemplates[j]]=[quickTemplates[j],quickTemplates[i]];await persistState();renderQuickTemplateManager();renderQuickTemplateStrip();}
function openQuickTemplateManager(){renderQuickTemplateManager();show($('quickTemplateManagerScreen'));}
function renderQuickTemplateCategoryOptions(preferred){const sel=$('quickTemplateCategoryInput');if(!sel)return;sel.innerHTML='';visibleCategories().forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=`${c.icon} ${c.name}`;sel.appendChild(o);});sel.value=preferred&&[...sel.options].some(o=>o.value===preferred)?preferred:(visibleCategories()[0]?.id||'other');renderQuickTemplateSubcategories();}
function renderQuickTemplateSubcategories(preferred){const sel=$('quickTemplateSubcategoryInput');if(!sel)return;const cat=categoryById($('quickTemplateCategoryInput').value);sel.innerHTML='';(cat.subs||['其他']).forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;sel.appendChild(o);});if(preferred&&[...sel.options].some(o=>o.value===preferred))sel.value=preferred;}
function syncQuickTemplateTypeFields(){const type=$('quickTemplateTypeInput').value;$('quickTemplateExpenseFields').classList.toggle('hidden',type!=='expense');$('quickTemplateIncomeFields').classList.toggle('hidden',type!=='income');$('quickTemplateInvestmentFields').classList.toggle('hidden',type!=='investment');}
function openQuickTemplateEditor(id=null){quickTemplateEditingId=id;const q=id?quickTemplates.find(x=>x.id===id):null;$('quickTemplateEditorTitle').textContent=q?'編輯快速模板':'新增快速模板';$('quickTemplateIconInput').value=q?.icon||'⚡';$('quickTemplateNameInput').value=q?.name||'';$('quickTemplateTypeInput').value=q?.type||'expense';$('quickTemplateAmountInput').value=Number(q?.amount)>0?q.amount:'';$('quickTemplatePaymentInput').value=q?.payment||'card';$('quickTemplateIncomeCategoryInput').value=q?.incomeCategory||'其他收入';$('quickTemplateInvestmentCategoryInput').value=q?.investmentCategory||'股票／ETF';renderQuickTemplateCategoryOptions(q?.categoryId);if(q?.subcategory)renderQuickTemplateSubcategories(q.subcategory);syncQuickTemplateTypeFields();show($('quickTemplateEditorScreen'));}
async function saveQuickTemplate(){const name=$('quickTemplateNameInput').value.trim(),icon=$('quickTemplateIconInput').value.trim()||'⚡',type=$('quickTemplateTypeInput').value,amount=Number($('quickTemplateAmountInput').value||0);if(!name){toast('請輸入模板名稱');return;}let q={id:quickTemplateEditingId||uid(),name,icon,type,amount};if(type==='expense')q={...q,categoryId:$('quickTemplateCategoryInput').value,subcategory:$('quickTemplateSubcategoryInput').value,payment:$('quickTemplatePaymentInput').value};else if(type==='income')q={...q,incomeCategory:$('quickTemplateIncomeCategoryInput').value};else q={...q,investmentCategory:$('quickTemplateInvestmentCategoryInput').value};if(quickTemplateEditingId)quickTemplates=quickTemplates.map(x=>x.id===quickTemplateEditingId?q:x);else quickTemplates.push(q);await persistState();hide($('quickTemplateEditorScreen'));renderQuickTemplateManager();renderQuickTemplateStrip();toast('快速模板已儲存');}
async function deleteQuickTemplate(id){const q=quickTemplates.find(x=>x.id===id);if(!q||!confirm(`刪除「${q.name}」快速模板？`))return;quickTemplates=quickTemplates.filter(x=>x.id!==id);await persistState();renderQuickTemplateManager();renderQuickTemplateStrip();toast('已刪除模板');}

function renderCategoryManager(){
  const list=$('categoryManagerList'); if(!list)return; list.innerHTML=''; categories.forEach((c,i)=>{const row=document.createElement('div'); row.className='category-manage-row'+(c.hidden?' is-hidden':''); row.innerHTML=`<div class="category-manage-icon">${escapeHtml(c.icon)}</div><div class="category-manage-main"><strong>${c.favorite?'⭐ ':''}${escapeHtml(c.name)}${c.hidden?'（已隱藏）':''}</strong><span>${escapeHtml((c.subs||[]).join('、')||'無細分類')}</span></div><div class="category-actions"><button data-up title="往上">↑</button><button data-down title="往下">↓</button><button data-edit title="編輯">✎</button></div>`; row.querySelector('[data-up]').disabled=i===0;row.querySelector('[data-down]').disabled=i===categories.length-1;row.querySelector('[data-up]').onclick=()=>moveCategory(i,-1);row.querySelector('[data-down]').onclick=()=>moveCategory(i,1);row.querySelector('[data-edit]').onclick=()=>openCategoryEditor(c.id);list.appendChild(row);});
}
async function moveCategory(i,delta){ const j=i+delta;if(j<0||j>=categories.length)return;[categories[i],categories[j]]=[categories[j],categories[i]];await persistState();renderCategoryManager();renderCategoryPicker();renderBudget(); }
function openCategoryManager(){ renderCategoryManager(); show($('categoryManagerScreen')); }
function openCategoryEditor(id=null){ categoryEditingId=id; const c=id?categoryById(id):null; $('categoryEditorTitle').textContent=c?'編輯類別':'新增類別'; $('categoryIconInput').value=c?.icon||'📌'; $('categoryNameInput').value=c?.name||''; $('categorySubsInput').value=(c?.subs||[]).join('\n'); $('categoryFavoriteInput').checked=!!c?.favorite; $('categoryHiddenInput').checked=!!c?.hidden; show($('categoryEditorScreen')); setTimeout(()=>$('categoryNameInput').focus(),120); }
async function saveCategory(){
  const name=$('categoryNameInput').value.trim(),icon=$('categoryIconInput').value.trim()||'📌',subs=$('categorySubsInput').value.split(/\n|、|,/).map(s=>s.trim()).filter(Boolean); if(!name){toast('請輸入類別名稱');return;}
  if(categoryEditingId){ const c=categoryById(categoryEditingId); c.name=name;c.icon=icon;c.subs=subs.length?subs:['其他'];c.favorite=$('categoryFavoriteInput').checked;c.hidden=$('categoryHiddenInput').checked; }
  else{ const id=`custom-${uid()}`; categories.push({id,name,icon,subs:subs.length?subs:['其他'],favorite:$('categoryFavoriteInput').checked,hidden:$('categoryHiddenInput').checked}); }
  await persistState(); hide($('categoryEditorScreen')); renderCategoryManager(); renderCategoryPicker(); renderBudget(); renderAnalysis(); toast('類別已儲存');
}

async function isFaceAvailable(){ try{return !!(window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());}catch{return false;} }
async function registerFaceId(){
  if(!await isFaceAvailable())throw new Error('此裝置或瀏覽器目前無法使用 Face ID'); authInProgress=true;
  try{
    const cred=await navigator.credentials.create({publicKey:{challenge:randomBytes(32),rp:{name:'小日子記帳'},user:{id:randomBytes(16),name:`local-${Date.now()}@little-days`,displayName:'小日子記帳'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},timeout:60000,attestation:'none'}});
    if(!cred)throw new Error('Face ID 設定未完成'); authConfig.faceCredentialId=b64url(cred.rawId); authConfig.faceEnabled=true; saveAuthConfig(); return true;
  } finally{ authInProgress=false; }
}
async function authenticateFaceId(){
  if(!authConfig.faceEnabled||!authConfig.faceCredentialId)throw new Error('尚未啟用 Face ID'); authInProgress=true;
  try{ const result=await navigator.credentials.get({publicKey:{challenge:randomBytes(32),allowCredentials:[{type:'public-key',id:fromB64url(authConfig.faceCredentialId)}],userVerification:'required',timeout:60000}}); if(!result)throw new Error('Face ID 驗證未完成'); return true; } finally{authInProgress=false;}
}
async function finishInitialSetup(){
  const pin=normalizePin($('setupPinInput').value),confirmPin=normalizePin($('setupPinConfirmInput').value); if(!validPin(pin)){ $('setupMessage').textContent='請設定 6 位數密碼';return;} if(pin!==confirmPin){$('setupMessage').textContent='兩次密碼不一致';return;}
  $('setupMessage').textContent='正在建立安全儲存…'; const salt=randomBytes(16); authConfig={pinSalt:bytesToB64(salt),pinHash:await derivePinVerifier(pin,salt),faceEnabled:false,createdAt:new Date().toISOString()}; saveAuthConfig(); await getDeviceKey(); unlocked=true; await loadVault();
  if($('setupFaceCheck').checked){ try{await registerFaceId();}catch(e){console.warn(e);toast('Face ID 尚未啟用，可稍後在設定裡再開啟',3000);} }
  unlockAppUi();
}
async function unlockWithPin(){ const pin=normalizePin($('pinUnlockInput').value); if(!validPin(pin)){ $('unlockMessage').textContent='請輸入 6 位數密碼';return;} $('unlockMessage').textContent='驗證中…'; if(!await verifyPin(pin)){ $('unlockMessage').textContent='密碼不正確';$('pinUnlockInput').value='';return;} await completeUnlock(); }
function updatePinUnlockState(){ const input=$('pinUnlockInput'),btn=$('pinUnlockBtn'); if(!input||!btn)return; const ready=validPin(normalizePin(input.value)); btn.disabled=!ready; btn.setAttribute('aria-disabled',String(!ready)); if(ready&&$('unlockMessage').textContent==='請輸入 6 位數密碼')$('unlockMessage').textContent=''; }
async function unlockWithFace(){ try{$('unlockMessage').textContent='請完成 Face ID 驗證';await authenticateFaceId();await completeUnlock();}catch(e){console.warn(e);$('unlockMessage').textContent='Face ID 未完成，可改用密碼';} }
async function completeUnlock(){ unlocked=true; try{await loadVault(); unlockAppUi();}catch(e){console.error(e);unlocked=false;$('unlockMessage').textContent='資料解鎖失敗，請重新整理再試';} }
function unlockAppUi(){ document.body.classList.remove('locked'); hide($('lockScreen')); $('app').setAttribute('aria-hidden','false'); $('pinUnlockInput').value=''; updatePinUnlockState(); $('unlockMessage').textContent=''; renderCategoryPicker(); renderSubcategories(); renderAll(); refreshSecurityUi(); showPostUpdateNotice(); }
function lockApp(reason='background'){
  if(!unlocked)return; collapseVoiceFab(); stopVoiceSession(); ['editorScreen','calculatorScreen','voiceSheet','voiceDraftScreen','voiceDraftEditScreen','txnMenuScreen','budgetEditorScreen','settingsScreen','securityScreen','quickTemplateManagerScreen','quickTemplateEditorScreen','insightDetailScreen','categoryManagerScreen','categoryEditorScreen','recurringManagerScreen','recurringEditorScreen','recurringDeleteScreen'].forEach(id=>hide($(id))); unlocked=false;vaultLoaded=false;txns=[];budgets={};categories=clone(DEFAULT_CATEGORIES);quickTemplates=clone(DEFAULT_QUICK_TEMPLATES);settings={};recurring=[]; document.body.classList.add('locked'); show($('lockScreen')); show($('unlockPanel')); hide($('setupPanel')); $('app').setAttribute('aria-hidden','true'); updatePinUnlockState(); refreshLockFaceUi();
}
async function refreshLockFaceUi(){ const yes=!!authConfig.faceEnabled&&!!authConfig.faceCredentialId&&await isFaceAvailable(); $('faceUnlockBtn').classList.toggle('hidden',!yes); $('faceDivider').classList.toggle('hidden',!yes); }
async function refreshSecurityUi(){ if(!$('faceStatusText'))return; const avail=await isFaceAvailable(); if(authConfig.faceEnabled&&authConfig.faceCredentialId){$('faceStatusText').textContent='已啟用。離開 App 後，回來可用 Face ID 重新解鎖。';$('toggleFaceBtn').textContent='重新設定 Face ID';}else{$('faceStatusText').textContent=avail?'尚未啟用。':'此裝置／瀏覽器目前無法使用平台生物辨識。';$('toggleFaceBtn').textContent='啟用 Face ID';$('toggleFaceBtn').disabled=!avail;} }
async function changePin(){ const oldPin=prompt('請先輸入目前的 6 位數密碼'); if(oldPin===null)return;if(!await verifyPin(normalizePin(oldPin))){toast('目前密碼不正確');return;} const p1=prompt('請輸入新的 6 位數密碼');if(p1===null)return;const pin=normalizePin(p1);if(!validPin(pin)){toast('新密碼必須是 6 位數');return;} const p2=prompt('請再輸入一次新密碼');if(normalizePin(p2)!==pin){toast('兩次新密碼不一致');return;} const salt=randomBytes(16);authConfig.pinSalt=bytesToB64(salt);authConfig.pinHash=await derivePinVerifier(pin,salt);saveAuthConfig();toast('密碼已變更'); }

async function checkForUpdate(){ $('updateStatus').textContent='正在檢查…';hide($('updateNowBtn'));try{const resp=await fetch(`index.html?update_check=${Date.now()}`,{cache:'no-store'}),html=await resp.text(),m=html.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)/i);availableVersion=m?.[1]||null;if(!availableVersion){$('updateStatus').textContent='無法讀取線上版本';return;}if(compareVersion(availableVersion,APP_VERSION)>0){$('updateStatus').textContent=`有新版 V${availableVersion}`;show($('updateNowBtn'));}else $('updateStatus').textContent=`已是最新版本 V${APP_VERSION}`;}catch(e){console.warn(e);$('updateStatus').textContent='檢查失敗，請稍後再試';} }
function compareVersion(a,b){const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++){if((aa[i]||0)!==(bb[i]||0))return(aa[i]||0)-(bb[i]||0);}return 0;}
function backupAgeDays(){if(!settings.lastBackupAt)return Infinity;const d=new Date(settings.lastBackupAt);if(Number.isNaN(d.getTime()))return Infinity;return (Date.now()-d.getTime())/86400000;}
function renderBackupStatus(){const el=$('backupStatusText');if(!el)return;if(!settings.lastBackupAt){el.textContent='尚未建立備份 · 建議更新前先備份';el.className='backup-status warning';return;}const d=new Date(settings.lastBackupAt),age=backupAgeDays();el.textContent=`最近備份：${d.toLocaleDateString('zh-TW')} ${d.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}${age>7?' · 已超過 7 天':''}`;el.className=`backup-status ${age>7?'warning':'good'}`;}
async function updateNow(){
  if(backupAgeDays()>3&&!confirm('你最近 3 天內沒有備份。仍要直接更新嗎？\n\n建議先按「取消」，到備份區匯出一次 JSON。'))return;
  $('updateStatus').textContent='正在更新…';
  try{sessionStorage.setItem('littleDaysUpdateCompleted','1');}catch{}
  hide($('settingsScreen'));
  setPage('home');
  try{
    const regs=await navigator.serviceWorker?.getRegistrations?.();
    for(const r of regs||[])await r.update();
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>caches.delete(k)));
    location.reload();
  }catch{location.reload();}
}
function returnHomeFromSettings(){
  hide($('settingsScreen'));
  setPage('home');
}
function showPostUpdateNotice(){
  let updated=false;
  try{updated=sessionStorage.getItem('littleDaysUpdateCompleted')==='1';if(updated)sessionStorage.removeItem('littleDaysUpdateCompleted');}catch{}
  if(updated){
    setPage('home');
    setTimeout(()=>toast(`更新完成 · V${APP_VERSION}`,2600),250);
  }
}

async function exportBackup(){ settings.lastBackupAt=new Date().toISOString();await persistState();const data={app:'little-days-bookkeeping',version:APP_VERSION,dataVersion:DATA_VERSION,exportedAt:settings.lastBackupAt,txns,budgets,categories,quickTemplates,settings,recurring};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`小日子記帳備份_${dateKey(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);renderBackupStatus();toast('備份檔已產生，請妥善保存'); }
async function importBackupFile(file){ try{const data=JSON.parse(await file.text());if(data.app!=='little-days-bookkeeping'||!Array.isArray(data.txns))throw new Error('bad');const mergeOnly=Boolean(data.mergeOnly);if(!confirm(`匯入 ${data.txns.length} 筆紀錄？目前資料會以 ID 合併。${mergeOnly?'\n這是私人一次性資料檔，不會覆蓋其他設定。':''}`))return;const map=new Map(txns.map(t=>[t.id,t]));data.txns.forEach(t=>map.set(t.id||uid(),t));txns=[...map.values()];if(mergeOnly){if(Array.isArray(data.recurring)){const rmap=new Map(recurring.map(r=>[r.id,r]));data.recurring.forEach(r=>rmap.set(r.id||uid(),r));recurring=[...rmap.values()];}settings={...settings,lastRestoreAt:new Date().toISOString()};}else{budgets={...budgets,...(data.budgets||{})};if(Array.isArray(data.categories)&&data.categories.length)categories=data.categories;if(Array.isArray(data.quickTemplates)&&data.quickTemplates.length)quickTemplates=data.quickTemplates;if(Array.isArray(data.recurring))recurring=data.recurring;settings={...settings,...(data.settings||{}),lastRestoreAt:new Date().toISOString()};}normalizeData();migrateHistoricalCategorySummaries();normalizeData();await persistState();renderAll();renderBackupStatus();toast(mergeOnly?'私人資料合併完成':'備份還原完成');}catch{toast('這不是有效的記帳備份檔',2600);} }

function bindEvents(){
  $('prevMonthBtn').onclick=()=>{viewMonth=addMonths(viewMonth,-1);selectedDate=dateKey(viewMonth);renderAll();}; $('nextMonthBtn').onclick=()=>{viewMonth=addMonths(viewMonth,1);selectedDate=dateKey(viewMonth);renderAll();};
  $('addFromDayBtn').onclick=()=>openEditor(null,selectedDate); $('manualAddNav').onclick=()=>openEditor(null,selectedDate); document.querySelectorAll('.manual-add-clone').forEach(b=>b.onclick=()=>openEditor(null,selectedDate));
  $('voiceFab').onclick=handleVoiceFabClick; $('closeVoiceBtn').onclick=()=>closeVoiceSheet(true); $('finishVoiceBtn').onclick=finishVoice; $('voiceFallbackBtn').onclick=()=>{show($('voiceFallbackInput'));$('voiceFallbackInput').focus();};
  $('amountInput').onclick=openCalculator; $('amountCalcBtn').onclick=openCalculator; $('closeCalculatorBtn').onclick=closeCalculator; $('applyCalculatorBtn').onclick=applyCalculator; $('calculatorPad').onclick=e=>{const b=e.target.closest('button[data-calc]');if(b)calculatorKey(b.dataset.calc);};
  $('cancelVoiceDraftBtn').onclick=closeVoiceDrafts; $('saveVoiceDraftBtn').onclick=saveVoiceDrafts; $('voiceDraftList').onclick=e=>{const edit=e.target.closest('[data-voice-edit]'),remove=e.target.closest('[data-voice-remove]');if(edit){openVoiceDraftItemEditor(Number(edit.dataset.voiceEdit));return;}if(remove){voiceDraftItems.splice(Number(remove.dataset.voiceRemove),1);renderVoiceDrafts();}}; $('cancelVoiceDraftEditBtn').onclick=()=>hide($('voiceDraftEditScreen')); $('saveVoiceDraftEditBtn').onclick=saveVoiceDraftItemEdit; $('voiceDraftEditCategory').onchange=()=>renderVoiceDraftEditSubcategories();
  $('cancelEditBtn').onclick=closeEditor; $('saveTxnBtn').onclick=saveTxn; $('expenseTypeBtn').onclick=()=>setEditType('expense'); $('incomeTypeBtn').onclick=()=>setEditType('income'); $('investmentTypeBtn').onclick=()=>setEditType('investment'); document.querySelectorAll('[data-payment]').forEach(b=>b.onclick=()=>setPayment(b.dataset.payment));
  $('closeTxnMenuBtn').onclick=closeTxnMenu; $('editTxnBtn').onclick=()=>{const t=txns.find(x=>x.id===actionTxnId);if(!t)return;if(t.recurringId)openRecurringEditScope();else{closeTxnMenu();openEditor(t);}}; $('deleteTxnBtn').onclick=deleteTxn; $('deleteOccurrenceBtn').onclick=deleteOccurrenceOnly; $('stopRecurringFromBtn').onclick=stopRecurringFromOccurrence; $('cancelRecurringDeleteBtn').onclick=closeRecurringDelete; $('editOccurrenceOnlyBtn').onclick=editOccurrenceOnly; $('editRecurringFromBtn').onclick=editRecurringFromOccurrence; $('cancelRecurringEditScopeBtn').onclick=closeRecurringEditScope;
  $('editBudgetBtn').onclick=openBudgetEditor; $('cancelBudgetBtn').onclick=()=>hide($('budgetEditorScreen')); $('saveBudgetBtn').onclick=saveBudgetEditor; $('closeInsightDetailBtn').onclick=closeInsightDetail; $('insightDetailAnalysisBtn').onclick=()=>{closeInsightDetail();setPage('analysis');}; $('goAnalysisBtn').onclick=()=>setPage('analysis'); document.querySelectorAll('.summary-action[data-insight]').forEach(b=>b.onclick=()=>{homeInsightMode=b.dataset.insight;renderHome();}); document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>setPage(b.dataset.page)); document.querySelectorAll('[data-back-home]').forEach(b=>b.onclick=()=>setPage('home'));
  $('openSettingsBtn').onclick=()=>{renderBackupStatus();show($('settingsScreen'));}; $('closeSettingsBtn').onclick=returnHomeFromSettings; $('settingsHomeBtn').onclick=returnHomeFromSettings; $('updateHomeBtn').onclick=returnHomeFromSettings; $('checkUpdateBtn').onclick=checkForUpdate; $('updateNowBtn').onclick=updateNow; $('exportBtn').onclick=exportBackup; $('importBtn').onclick=()=>$('importFileInput').click(); $('importFileInput').onchange=e=>{const f=e.target.files?.[0];if(f)importBackupFile(f);e.target.value='';};
  $('manageQuickTemplatesBtn').onclick=openQuickTemplateManager; $('manageQuickTemplatesHomeBtn').onclick=openQuickTemplateManager; $('closeQuickTemplateManagerBtn').onclick=()=>hide($('quickTemplateManagerScreen')); $('addQuickTemplateBtn').onclick=()=>openQuickTemplateEditor(); $('cancelQuickTemplateEditBtn').onclick=()=>hide($('quickTemplateEditorScreen')); $('saveQuickTemplateBtn').onclick=saveQuickTemplate; $('quickTemplateTypeInput').onchange=syncQuickTemplateTypeFields; $('quickTemplateCategoryInput').onchange=()=>renderQuickTemplateSubcategories();
  $('wipeBtn').onclick=async()=>{if(confirm('確定要清除全部記帳資料、預算與自訂類別？安全密碼與 Face ID 設定會保留。')){txns=[];budgets={};categories=clone(DEFAULT_CATEGORIES);quickTemplates=clone(DEFAULT_QUICK_TEMPLATES);settings={};await persistState();hide($('settingsScreen'));renderAll();toast('已清除');}};
  $('manageCategoriesBtn').onclick=openCategoryManager; $('manageCategoriesInlineBtn').onclick=openCategoryManager; $('closeCategoryManagerBtn').onclick=()=>hide($('categoryManagerScreen')); $('addCategoryBtn').onclick=()=>openCategoryEditor(); $('cancelCategoryEditBtn').onclick=()=>hide($('categoryEditorScreen')); $('saveCategoryBtn').onclick=saveCategory;
  $('dateInput').addEventListener('change',updateEditorDateContext); $('editorRecurringInput').onchange=toggleEditorRecurringFields; $('editorRecurringFrequency').onchange=updateEditorRecurringHint; $('editorAddMonthlyDayBtn').onclick=addEditorMonthlyDay; $('editorRecurringMonthlyDayInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addEditorMonthlyDay();}});
  for(let m=0;m<12;m++){const o=document.createElement('option');o.value=String(m);o.textContent=`${m+1} 月`;$('analysisMonthSelect').appendChild(o);}
  $('analysisPrevYearBtn').onclick=()=>{analysisYear--;renderAnalysis();}; $('analysisNextYearBtn').onclick=()=>{analysisYear++;renderAnalysis();}; $('analysisYearModeBtn').onclick=()=>{analysisMode='year';renderAnalysis();}; $('analysisMonthModeBtn').onclick=()=>{analysisMode='month';renderAnalysis();}; $('analysisMonthSelect').onchange=e=>{analysisMonth=Number(e.target.value);renderAnalysis();};
  $('manageRecurringBtn').onclick=openRecurringManager; $('closeRecurringManagerBtn').onclick=()=>hide($('recurringManagerScreen')); $('addRecurringBtn').onclick=()=>openRecurringEditor(); $('cancelRecurringEditBtn').onclick=()=>{recurringSplitSourceId=null;recurringSplitEffectiveDate='';$('recurringStartDateInput').disabled=false;hide($('recurringEditorScreen'));}; $('saveRecurringBtn').onclick=saveRecurring; $('recurringExpenseTypeBtn').onclick=()=>setRecurringType('expense'); $('recurringIncomeTypeBtn').onclick=()=>setRecurringType('income'); $('recurringInvestmentTypeBtn').onclick=()=>setRecurringType('investment'); $('recurringFrequencyInput').onchange=updateRecurringFrequencyFields; $('recurringAddMonthlyDayBtn').onclick=addRecurringMonthlyDay; $('recurringMonthlyDayInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addRecurringMonthlyDay();}}); $('recurringCategoryInput').onchange=()=>renderRecurringSubcategories(); document.querySelectorAll('[data-recurring-payment]').forEach(b=>b.onclick=()=>setRecurringPayment(b.dataset.recurringPayment));
    $('manageSecurityBtn').onclick=()=>{show($('securityScreen'));refreshSecurityUi();}; $('closeSecurityBtn').onclick=()=>hide($('securityScreen')); $('changePinBtn').onclick=changePin; $('toggleFaceBtn').onclick=async()=>{try{await registerFaceId();refreshSecurityUi();toast('Face ID 已啟用');}catch(e){console.warn(e);toast(e.message||'Face ID 設定未完成',2600);}};
  $('finishSetupBtn').onclick=finishInitialSetup; $('pinUnlockBtn').onclick=unlockWithPin; $('faceUnlockBtn').onclick=unlockWithFace; $('pinUnlockInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&validPin(normalizePin(e.currentTarget.value)))unlockWithPin();});
  for(const id of ['setupPinInput','setupPinConfirmInput','pinUnlockInput'])$(id).addEventListener('input',e=>{e.target.value=normalizePin(e.target.value); if(e.target.id==='pinUnlockInput')updatePinUnlockState();});
  document.addEventListener('pointerdown',e=>{const fab=$('voiceFab');if(fab?.classList.contains('expanded')&&!fab.contains(e.target))collapseVoiceFab();});
}

async function bootAuth(){
  if(authConfig.pinHash){ hide($('setupPanel'));show($('unlockPanel'));updatePinUnlockState();await refreshLockFaceUi(); } else{ hide($('unlockPanel'));show($('setupPanel')); }
}

function installPrivacyLock(){
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&unlocked&&!authInProgress)lockApp('hidden'); });
  window.addEventListener('pagehide',()=>{ if(unlocked&&!authInProgress)lockApp('pagehide'); });
  window.addEventListener('blur',()=>{ /* iOS app switching is primarily handled by visibilitychange. */ });
}
function registerServiceWorker(){ if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(console.warn)); }

async function init(){ bindEvents();installPrivacyLock();registerServiceWorker();await bootAuth(); }
document.addEventListener('DOMContentLoaded',init);
