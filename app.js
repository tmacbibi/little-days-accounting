'use strict';

const $ = id => document.getElementById(id);
const APP_VERSION = '1.5.7';
const DATA_VERSION = 13;
const VAULT_KEY = 'little_days_bookkeeping_vault_v2';
const AUTH_KEY = 'little_days_bookkeeping_auth_v2';
const LEGACY_TXN_KEY = 'little_days_bookkeeping_txns_v1';
const LEGACY_BUDGET_KEY = 'little_days_bookkeeping_budget_v1';
const LEGACY_SETTINGS_KEY = 'little_days_bookkeeping_settings_v1';
const DB_NAME = 'little_days_bookkeeping_secure_v1';
const DB_STORE = 'keys';
const DEVICE_KEY_ID = 'device-aes-key';
const PIN_WRAP_ITERATIONS = 240000;
const DEFAULT_INVESTMENT_FEE_CONFIG = Object.freeze({regularRate:0.001425,regularDiscount:0.28,regularMinFee:20,recurringFee:1});

const HISTORICAL_SEED_VERSION = '';
const HISTORICAL_SEED_TXNS = [];
const HISTORICAL_SEED_RECURRING = [];

const HISTORICAL_CATEGORY_SPLIT_VERSION = '2026-v2';
const HISTORICAL_CATEGORY_SPLITS = {
  "2026-01":[{categoryId:"food",subcategory:"家庭餐飲",amount:6318},{categoryId:"food",subcategory:"上班餐飲",amount:4199},{categoryId:"home",subcategory:"日用品",amount:2742},{categoryId:"shopping",subcategory:"個人購物",amount:2659},{categoryId:"leisure",subcategory:"旅遊",amount:1985},{categoryId:"other",subcategory:"其他",amount:1195},{categoryId:"food",subcategory:"個人餐飲",amount:989},{categoryId:"shopping",subcategory:"網購",amount:749},{categoryId:"transport",subcategory:"充電／加油",amount:665},{categoryId:"leisure",subcategory:"娛樂",amount:516},{categoryId:"leisure",subcategory:"訂閱服務",amount:380},{categoryId:"transport",subcategory:"停車",amount:215},{categoryId:"social",subcategory:"其他交際",amount:123},{categoryId:"transport",subcategory:"其他交通",amount:95},{categoryId:"transport",subcategory:"計程車",amount:62},{categoryId:"social",subcategory:"朋友聚餐／請客",amount:58},{categoryId:"health",subcategory:"藥品",amount:23}],
  "2026-02":[{categoryId:"home",subcategory:"日用品",amount:6221},{categoryId:"transport",subcategory:"充電／加油",amount:5000},{categoryId:"leisure",subcategory:"娛樂",amount:4280},{categoryId:"shopping",subcategory:"網購",amount:4160},{categoryId:"food",subcategory:"家庭餐飲",amount:3873},{categoryId:"food",subcategory:"上班餐飲",amount:2161},{categoryId:"other",subcategory:"其他",amount:1433},{categoryId:"shopping",subcategory:"個人購物",amount:80},{categoryId:"leisure",subcategory:"訂閱服務",amount:30}],
  "2026-03":[{categoryId:"food",subcategory:"家庭餐飲",amount:5590},{categoryId:"food",subcategory:"上班餐飲",amount:3307},{categoryId:"shopping",subcategory:"網購",amount:970},{categoryId:"home",subcategory:"日用品",amount:921},{categoryId:"food",subcategory:"個人餐飲",amount:762},{categoryId:"leisure",subcategory:"訂閱服務",amount:495},{categoryId:"social",subcategory:"其他交際",amount:480},{categoryId:"other",subcategory:"其他",amount:165},{categoryId:"transport",subcategory:"停車",amount:135}],
  "2026-04":[{categoryId:"food",subcategory:"上班餐飲",amount:15538},{categoryId:"home",subcategory:"日用品",amount:8001},{categoryId:"food",subcategory:"家庭餐飲",amount:5520},{categoryId:"food",subcategory:"個人餐飲",amount:1563},{categoryId:"shopping",subcategory:"個人購物",amount:775},{categoryId:"leisure",subcategory:"訂閱服務",amount:691},{categoryId:"transport",subcategory:"停車",amount:500},{categoryId:"social",subcategory:"朋友聚餐／請客",amount:290},{categoryId:"other",subcategory:"其他",amount:102},{categoryId:"transport",subcategory:"充電／加油",amount:100}],
  "2026-05":[{categoryId:"shopping",subcategory:"個人購物",amount:19883},{categoryId:"home",subcategory:"日用品",amount:9891},{categoryId:"food",subcategory:"家庭餐飲",amount:7072},{categoryId:"food",subcategory:"上班餐飲",amount:3923},{categoryId:"other",subcategory:"其他",amount:2763},{categoryId:"transport",subcategory:"計程車",amount:857},{categoryId:"transport",subcategory:"停車",amount:703},{categoryId:"leisure",subcategory:"訂閱服務",amount:183},{categoryId:"food",subcategory:"個人餐飲",amount:155}],
  "2026-06":[{categoryId:"food",subcategory:"家庭餐飲",amount:10708},{categoryId:"shopping",subcategory:"個人購物",amount:6199},{categoryId:"food",subcategory:"上班餐飲",amount:4464},{categoryId:"other",subcategory:"其他",amount:1149},{categoryId:"home",subcategory:"日用品",amount:903},{categoryId:"leisure",subcategory:"訂閱服務",amount:730},{categoryId:"food",subcategory:"個人餐飲",amount:483},{categoryId:"transport",subcategory:"停車",amount:305},{categoryId:"social",subcategory:"朋友聚餐／請客",amount:225},{categoryId:"transport",subcategory:"充電／加油",amount:191},{categoryId:"health",subcategory:"藥品",amount:180}],
  "2026-07":[{categoryId:"food",subcategory:"家庭餐飲",amount:19355},{categoryId:"food",subcategory:"上班餐飲",amount:5292},{categoryId:"food",subcategory:"個人餐飲",amount:3332},{categoryId:"shopping",subcategory:"個人購物",amount:2782},{categoryId:"leisure",subcategory:"旅遊",amount:2337},{categoryId:"leisure",subcategory:"訂閱服務",amount:730},{categoryId:"other",subcategory:"其他",amount:684},{categoryId:"home",subcategory:"日用品",amount:652},{categoryId:"transport",subcategory:"停車",amount:451},{categoryId:"transport",subcategory:"其他交通",amount:400},{categoryId:"transport",subcategory:"充電／加油",amount:306}],
  "2026-08":[{categoryId:"leisure",subcategory:"旅遊",amount:12114},{categoryId:"other",subcategory:"其他",amount:3835},{categoryId:"food",subcategory:"個人餐飲",amount:1807},{categoryId:"food",subcategory:"家庭餐飲",amount:1620},{categoryId:"food",subcategory:"上班餐飲",amount:1473},{categoryId:"shopping",subcategory:"個人購物",amount:605},{categoryId:"home",subcategory:"日用品",amount:505},{categoryId:"transport",subcategory:"其他交通",amount:400},{categoryId:"leisure",subcategory:"訂閱服務",amount:59}]
};


const DEFAULT_CATEGORIES = [
  {id:'food',name:'餐飲',icon:'🍽️',hidden:false,subs:['上班餐飲','家庭餐飲','個人餐飲']},
  {id:'social',name:'交際應酬',icon:'🥂',hidden:false,subs:['同事聚餐','朋友聚餐／請客','其他交際']},
  {id:'transport',name:'交通',icon:'🚗',hidden:false,subs:['停車','充電／加油','大眾運輸','計程車','保養／維修','其他交通']},
  {id:'family',name:'家庭',icon:'👨‍👩‍👧‍👧',hidden:false,subs:['子女教育','子女用品','家庭活動','孝親／長輩','其他家庭']},
  {id:'shopping',name:'購物',icon:'🛍️',hidden:false,subs:['個人購物','服飾','3C／家電','網購','其他購物']},
  {id:'home',name:'居家生活',icon:'🏠',hidden:false,subs:['水電瓦斯','電話網路','日用品','家具家電／居家維修','其他居家']},
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
let investmentLedger = [];
let investmentQuotes = [];
let investmentEditingId = null;
let investmentQuoteEditingId = null;
let dividendEvents = [];
let dividendEventEditingId = null;
let dividendCalendarSyncInFlight = null;
let annualIncomeSummaries = [];
let annualSummaryEditingYear = null;
let investmentDetailSymbol = null;
let autoQuoteRefreshInFlight = false;
let investmentValuesVisible = false;
let investmentReturnDetailYear = new Date().getFullYear();
let investmentRealizedYear = new Date().getFullYear();
let investmentRealizedSymbol = '';
let investmentRealizedOutcome = 'all';
let investmentDetailTab = 'overview';
const investmentBoundaryFetchInFlight = new Map();
const investmentBoundaryFetchAttempted = new Set();


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
function ntd(n){ return Math.round(Number(n)||0); }
function money(n){ return '$' + ntd(n).toLocaleString('zh-TW'); }
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
async function derivePinWrapKey(pin,salt,iterations=PIN_WRAP_ITERATIONS){
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function wrapMasterKeyBytes(rawBytes,pin){
  const salt=randomBytes(16),iv=randomBytes(12),iterations=PIN_WRAP_ITERATIONS,key=await derivePinWrapKey(pin,salt,iterations);
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,rawBytes);
  return {v:1,salt:bytesToB64(salt),iv:bytesToB64(iv),data:bytesToB64(cipher),iterations};
}
async function unwrapMasterKeyBytes(wrapped,pin){
  if(!wrapped?.salt||!wrapped?.iv||!wrapped?.data)throw new Error('PIN_RECOVERY_NOT_CONFIGURED');
  const key=await derivePinWrapKey(pin,b64ToBytes(wrapped.salt),Number(wrapped.iterations)||PIN_WRAP_ITERATIONS);
  const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(wrapped.iv)},key,b64ToBytes(wrapped.data));
  return new Uint8Array(raw);
}
async function importMasterKey(rawBytes){ return crypto.subtle.importKey('raw',rawBytes,{name:'AES-GCM'},false,['encrypt','decrypt']); }
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
  const key=await dbGet(DEVICE_KEY_ID);
  if(key)return key;
  // V1.4.3 起：只要曾建立 Vault 或 PIN 復原包，就絕不靜默產生新金鑰。
  if(localStorage.getItem(VAULT_KEY)||authConfig.masterKeyWrapped)throw new Error('DEVICE_KEY_MISSING');
  throw new Error('DEVICE_KEY_NOT_INITIALIZED');
}
async function encryptJsonWithKey(obj,key){
  const iv=randomBytes(12),plain=new TextEncoder().encode(JSON.stringify(obj));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
  return JSON.stringify({v:3,iv:bytesToB64(iv),data:bytesToB64(cipher)});
}
async function decryptJsonWithKey(payload,key){
  const parsed=JSON.parse(payload),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(parsed.iv)},key,b64ToBytes(parsed.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function encryptJson(obj){ return encryptJsonWithKey(obj,await getDeviceKey()); }
async function decryptJson(payload){ return decryptJsonWithKey(payload,await getDeviceKey()); }
async function createRecoverableMasterKey(pin){
  const raw=randomBytes(32),key=await importMasterKey(raw);
  authConfig.masterKeyWrapped=await wrapMasterKeyBytes(raw,pin);
  authConfig.keyProtectionVersion=1;
  await dbPut(DEVICE_KEY_ID,key);
  saveAuthConfig();
  return key;
}
async function recoverDeviceKeyWithPin(pin){
  const raw=await unwrapMasterKeyBytes(authConfig.masterKeyWrapped,pin),key=await importMasterKey(raw);
  await dbPut(DEVICE_KEY_ID,key);
  return key;
}
async function ensureRecoverableKeyAfterPin(pin){
  const payload=localStorage.getItem(VAULT_KEY),storedKey=await dbGet(DEVICE_KEY_ID);
  if(authConfig.masterKeyWrapped){
    if(storedKey)return storedKey;
    return recoverDeviceKeyWithPin(pin);
  }
  if(!payload){ return createRecoverableMasterKey(pin); }
  if(!storedKey)throw new Error('LEGACY_DEVICE_KEY_MISSING');
  // 舊版不可匯出金鑰無法直接備援：先用舊金鑰解密，再以新的可復原主金鑰重新加密。
  const state=await decryptJsonWithKey(payload,storedKey);
  const raw=randomBytes(32),newKey=await importMasterKey(raw),wrapped=await wrapMasterKeyBytes(raw,pin);
  const migratedPayload=await encryptJsonWithKey(state,newKey);
  await dbPut(DEVICE_KEY_ID,newKey);
  localStorage.setItem(VAULT_KEY,migratedPayload);
  authConfig.masterKeyWrapped=wrapped;authConfig.keyProtectionVersion=1;authConfig.keyMigratedAt=new Date().toISOString();saveAuthConfig();
  return newKey;
}


function sameSeedTxn(a,b){
  return a&&b&&String(a.date||'')===String(b.date||'')&&String(a.type||'')===String(b.type||'')&&
    String(a.title||'')===String(b.title||'')&&Number(a.amount||0)===Number(b.amount||0);
}
function applyHistoricalSeed(){ return false; }

function currentState(){ return {version:DATA_VERSION,txns,budgets,categories,quickTemplates,settings,recurring,investmentLedger,investmentQuotes,dividendEvents,annualIncomeSummaries}; }
async function persistState(){ if(!unlocked)return; reconcileInvestmentLinks(); localStorage.setItem(VAULT_KEY,await encryptJson(currentState())); }
async function loadVault(){
  const payload=localStorage.getItem(VAULT_KEY);
  if(payload){
    const st=await decryptJson(payload);
    txns=Array.isArray(st.txns)?st.txns:[]; budgets=st.budgets||{}; categories=Array.isArray(st.categories)&&st.categories.length?st.categories:clone(DEFAULT_CATEGORIES); quickTemplates=Array.isArray(st.quickTemplates)&&st.quickTemplates.length?st.quickTemplates:clone(DEFAULT_QUICK_TEMPLATES); settings=st.settings||{}; recurring=Array.isArray(st.recurring)?st.recurring:(Array.isArray(st.settings?.recurring)?st.settings.recurring:[]); investmentLedger=Array.isArray(st.investmentLedger)?st.investmentLedger:[]; investmentQuotes=Array.isArray(st.investmentQuotes)?st.investmentQuotes:[]; dividendEvents=Array.isArray(st.dividendEvents)?st.dividendEvents:[]; annualIncomeSummaries=Array.isArray(st.annualIncomeSummaries)?st.annualIncomeSummaries:[];
  }else{
    txns=loadLegacyJson(LEGACY_TXN_KEY,[]); budgets=loadLegacyJson(LEGACY_BUDGET_KEY,{}); settings=loadLegacyJson(LEGACY_SETTINGS_KEY,{}); categories=clone(DEFAULT_CATEGORIES); quickTemplates=clone(DEFAULT_QUICK_TEMPLATES); recurring=Array.isArray(settings.recurring)?settings.recurring:[]; investmentLedger=[]; investmentQuotes=[]; dividendEvents=[]; annualIncomeSummaries=[];
  }
  normalizeData(); applyHistoricalSeed(); normalizeData(); migrateHistoricalCategorySummaries(); normalizeData(); migrateCategoriesV156(); normalizeData(); vaultLoaded=true;
  await processRecurringDue(false);
  await persistState();
  localStorage.removeItem(LEGACY_TXN_KEY); localStorage.removeItem(LEGACY_BUDGET_KEY); localStorage.removeItem(LEGACY_SETTINGS_KEY);
}
function loadLegacyJson(key,fallback){ try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;} }
function normalizeData(){
  categories.forEach(c=>{ if(typeof c.favorite!=='boolean')c.favorite=['food','social','transport'].includes(c.id); if(!Array.isArray(c.subs)||!c.subs.length)c.subs=['其他']; });
  if(!Array.isArray(quickTemplates)||!quickTemplates.length)quickTemplates=clone(DEFAULT_QUICK_TEMPLATES);
  quickTemplates=quickTemplates.map((q,i)=>({...q,id:q.id||`qt-${uid()}`,icon:q.icon||'⚡',name:q.name||`快速模板 ${i+1}`,type:q.type||'expense',amount:ntd(q.amount||0)}));
  const nameToId=new Map(categories.map(c=>[c.name,c.id]));
  for(const t of txns){
    if(!t.id)t.id=uid();
    if(t.type==='expense'&&!t.categoryId){ t.categoryId=nameToId.get(t.category)||'other'; }
    if(!t.type)t.type='expense';
    t.amount=ntd(t.amount||0);
    t.voided=Boolean(t.voided);
    if(!t.createdAt)t.createdAt=new Date().toISOString();
  }
  // V1.4.5: 私人匯入可用 voided 撤銷早期誤產生的週期占位，不讓它們留在統計或畫面。
  txns=txns.filter(t=>!t.voided);

  if(!Array.isArray(investmentLedger))investmentLedger=[];
  investmentLedger=investmentLedger.map(t=>({
    ...t,
    id:t.id||uid(),
    kind:['initial','buy','sell','dividend','contribution'].includes(t.kind)?t.kind:'buy',
    symbol:String(t.symbol||'').trim().toUpperCase(),
    name:String(t.name||'').trim(),
    title:String(t.title||'').trim(),
    date:t.date||dateKey(new Date()),
    quantity:Number(t.quantity||0),price:Number(t.price||0),fee:ntd(t.fee||0),tax:ntd(t.tax||0),amount:ntd(t.amount||0),
    ownedBy:t.ownedBy||((t.kind==='contribution')?'bookkeeping':(t.kind==='buy'?'investment':'shared')),status:t.status||((t.kind==='contribution')?'pending':'complete'),
    securityType:t.securityType||'',shortName:t.shortName||'',feeMode:t.feeMode||'auto',taxMode:t.taxMode||'auto',
    costPending:Boolean(t.costPending)||((['initial','buy'].includes(t.kind))&&Number(t.quantity||0)>0&&Number(t.price||0)<=0&&t.status==='pending'),
    datePending:Boolean(t.datePending),voided:Boolean(t.voided),
    createdAt:t.createdAt||new Date().toISOString()
  })).filter(t=>(t.symbol||t.kind==='contribution')&&!t.voided);
  if(!Array.isArray(investmentQuotes))investmentQuotes=[];
  investmentQuotes=investmentQuotes.map(q=>({...q,id:q.id||uid(),symbol:String(q.symbol||'').trim().toUpperCase(),name:String(q.name||'').trim(),price:Number(q.price||0),date:q.date||dateKey(new Date()),priceType:q.priceType||'close',source:q.source||'manual',createdAt:q.createdAt||new Date().toISOString()})).filter(q=>q.symbol&&q.price>0);
  {const unique=new Map();for(const q of investmentQuotes){const k=`${q.symbol}|${q.date}|${q.priceType||'close'}`,prev=unique.get(k),stamp=String(q.updatedAt||q.createdAt||''),prevStamp=String(prev?.updatedAt||prev?.createdAt||'');if(!prev||stamp>=prevStamp)unique.set(k,q);}investmentQuotes=[...unique.values()];}
  if(!Array.isArray(dividendEvents))dividendEvents=[];
  dividendEvents=dividendEvents.map(e=>({...e,id:e.id||uid(),symbol:String(e.symbol||'').trim().toUpperCase(),name:String(e.name||'').trim(),shortName:String(e.shortName||'').trim(),securityType:String(e.securityType||''),exDate:String(e.exDate||''),recordDate:String(e.recordDate||''),expectedPayDate:String(e.expectedPayDate||''),actualPayDate:String(e.actualPayDate||''),perShare:Number(e.perShare||0),actualAmount:e.actualAmount==null||e.actualAmount===''?null:ntd(e.actualAmount),entitledShares:e.entitledShares==null||e.entitledShares===''?null:Number(e.entitledShares),entitlementFrozenAt:String(e.entitlementFrozenAt||''),source:String(e.source||''),sourceProvider:String(e.sourceProvider||''),sourceUrl:String(e.sourceUrl||''),sourceUpdatedAt:String(e.sourceUpdatedAt||''),statusOverride:String(e.statusOverride||''),note:String(e.note||''),createdAt:e.createdAt||new Date().toISOString(),bookkeepingTxnId:e.bookkeepingTxnId||null,ledgerTxnId:e.ledgerTxnId||null})).filter(e=>e.symbol&&(e.exDate||e.expectedPayDate||e.actualPayDate));
  if(!Array.isArray(annualIncomeSummaries))annualIncomeSummaries=[];
  annualIncomeSummaries=annualIncomeSummaries.map(a=>({year:Number(a.year),dividendIncome:ntd(a.dividendIncome||0),spouseBonus:ntd(a.spouseBonus||0),note:String(a.note||''),updatedAt:a.updatedAt||new Date().toISOString()})).filter(a=>Number.isInteger(a.year)&&a.year>=1900&&a.year<=2200);
  {const byYear=new Map();for(const a of annualIncomeSummaries){const prev=byYear.get(a.year);if(!prev||String(a.updatedAt||'')>=String(prev.updatedAt||''))byYear.set(a.year,a);}annualIncomeSummaries=[...byYear.values()];}
  // V1.4.4: legacy confirmed dividend ledger entries get a lightweight lifecycle event exactly once.
  const eventLedgerIds=new Set(dividendEvents.map(e=>e.ledgerTxnId).filter(Boolean));
  for(const t of investmentLedger.filter(x=>x.kind==='dividend'&&!eventLedgerIds.has(x.id))){
    dividendEvents.push({id:uid(),symbol:t.symbol,name:t.name||'',shortName:t.shortName||'',securityType:t.securityType||'',exDate:t.exDate||'',expectedPayDate:t.date,actualPayDate:t.date,perShare:Number(t.perShare||0),actualAmount:ntd(t.amount||0),statusOverride:'',note:t.note||'',createdAt:t.createdAt||new Date().toISOString(),bookkeepingTxnId:t.bookkeepingTxnId||null,ledgerTxnId:t.id});
  }
  settings.investmentFeeConfig={...DEFAULT_INVESTMENT_FEE_CONFIG,...(settings.investmentFeeConfig||{})};
  settings.investmentSecurityCache=settings.investmentSecurityCache&&typeof settings.investmentSecurityCache==='object'?settings.investmentSecurityCache:{};
  // Enrich common legacy holdings immediately so upgraded data gets names/types offline, too.
  for(const t of investmentLedger){
    const seed=SECURITY_SEED[t.symbol];
    if(!seed)continue;
    if(!t.name)t.name=seed.name;
    if(!t.shortName)t.shortName=seed.shortName;
    if(!t.securityType)t.securityType=seed.securityType;
  }
  for(const r of recurring){
    if(!r.id)r.id=uid();
    r.amount=ntd(r.amount||0);
    if(!Array.isArray(r.skipDates))r.skipDates=[];
    if(r.frequency==='monthly'&&!Array.isArray(r.monthlyDays))r.monthlyDays=[Number(r.dayOfMonth||parseDateKey(r.startDate||dateKey(new Date())).getDate())];
    if(Array.isArray(r.monthlyDays))r.monthlyDays=[...new Set(r.monthlyDays.map(Number).filter(n=>n>=1&&n<=31))].sort((a,b)=>a-b);
  }
  const foodCat=categories.find(c=>c.id==='food');
  if(foodCat&&!foodCat.subs.includes('個人餐飲'))foodCat.subs.push('個人餐飲');
  const familyCat=categories.find(c=>c.id==='family');
  if(familyCat){ if(familyCat.name==='家庭／小孩')familyCat.name='家庭'; }
  const fixedCat=categories.find(c=>c.id==='fixed');
  if(fixedCat&&!fixedCat.subs.includes('薪資扣除'))fixedCat.subs.splice(Math.max(0,fixedCat.subs.length-1),0,'薪資扣除');
  const migrated={...budgets};
  const mapLegacy={'餐飲':'food','交際應酬':'social','交通':'transport','家庭／小孩':'family','家庭':'family','購物':'shopping','居家生活':'home','娛樂休閒':'leisure','醫療健康':'health','固定費用':'fixed','其他':'other'};
  for(const [old,id] of Object.entries(mapLegacy)){ if(migrated[old]!=null&&migrated[`cat:${id}`]==null)migrated[`cat:${id}`]=migrated[old]; }
  if(migrated['餐飲::上班餐飲']!=null&&migrated['sub:food:上班餐飲']==null)migrated['sub:food:上班餐飲']=migrated['餐飲::上班餐飲'];
  if(migrated['餐飲::家庭餐飲']!=null&&migrated['sub:food:家庭餐飲']==null)migrated['sub:food:家庭餐飲']=migrated['餐飲::家庭餐飲'];
  budgets=migrated;
}


const CATEGORY_CLEANUP_V156 = 'v1.5.6-category-cleanup';
function migrateCategoriesV156(){
  if(settings?.categoryCleanupVersion===CATEGORY_CLEANUP_V156)return;
  let changed=false;
  const family=categories.find(c=>c.id==='family');
  const home=categories.find(c=>c.id==='home');
  if(family){
    const keep=(family.subs||[]).filter(s=>!['孝親費','教育','小孩用品','家庭用品'].includes(s));
    family.name='家庭';
    family.subs=[...new Set(['子女教育','子女用品','家庭活動','孝親／長輩','其他家庭',...keep.filter(s=>!['家庭活動','其他家庭'].includes(s))])];
    changed=true;
  }
  if(home){
    const keep=(home.subs||[]).filter(s=>!['生活雜支','家用品'].includes(s));
    home.subs=[...new Set(['水電瓦斯','電話網路','日用品','家具家電／居家維修','其他居家',...keep.filter(s=>!['水電瓦斯','電話網路','其他居家'].includes(s))])];
    changed=true;
  }
  const subMap={
    'family|教育':'子女教育',
    'family|小孩用品':'子女用品',
    'family|孝親費':'孝親／長輩',
    'family|家庭用品':'其他家庭',
    'home|生活雜支':'日用品',
    'home|家用品':'日用品'
  };
  for(const t of txns){
    if(t?.type!=='expense')continue;
    const next=subMap[`${t.categoryId}|${t.subcategory}`];
    if(next&&t.subcategory!==next){t.subcategory=next;changed=true;}
  }
  for(const r of recurring){
    if(r?.type!=='expense')continue;
    const next=subMap[`${r.categoryId}|${r.subcategory}`];
    if(next&&r.subcategory!==next){r.subcategory=next;changed=true;}
  }
  for(const q of quickTemplates){
    if(q?.type!=='expense')continue;
    const next=subMap[`${q.categoryId}|${q.subcategory}`];
    if(next&&q.subcategory!==next){q.subcategory=next;changed=true;}
  }
  settings={...settings,categoryCleanupVersion:CATEGORY_CLEANUP_V156};
  return changed;
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
  // 孝親費固定歸「家庭 > 孝親／長輩」。歷史總額不變，只改分類。
  for(const t of txns){
    if(t?.historicalSummary&&t.type==='expense'&&t.title==='孝親費'){
      if(t.categoryId!=='family'||t.subcategory!=='孝親／長輩'){ t.categoryId='family'; t.subcategory='孝親／長輩'; changed=true; }
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

function renderAll(){ if(!unlocked||!vaultLoaded)return; renderHome(); renderBudget(); renderAnalysis(); renderInvestment(); renderCategoryManager(); renderRecurringCount(); renderBackupStatus(); }
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
  const expense=sum(ex), income=sum(inc), investmentFlow=monthlyInvestmentNet(viewMonth), investment=investmentFlow.net, balance=income-expense;
  $('monthExpense').textContent=money(expense); $('monthIncome').textContent=money(income); $('monthInvestment').textContent=(investment<0?'-':'')+money(Math.abs(investment));
  $('monthInvestmentMeta').textContent=`買進 ${money(investmentFlow.buys)} · 賣出 ${money(investmentFlow.sells)}`;
  $('monthBalance').textContent=(balance<0?'-':'')+money(Math.abs(balance)); $('monthBalance').style.color=balance<0?'var(--expense)':'var(--income)';
  $('homeNetHero').textContent=(balance<0?'-':'')+money(Math.abs(balance)); $('homeNetHero').classList.toggle('negative',balance<0);
  $('homeNetHeroMeta').textContent=balance>=0?'收入扣除生活支出後的淨流入':'本月生活支出已高於收入';
  const baseDays=averageBaseDays(viewMonth); $('homeMonthPulse').textContent=baseDays?`${viewMonth.getMonth()+1}月 · 第 ${baseDays} 天`:`${viewMonth.getMonth()+1}月`;
  $('heroExpenseRatio').textContent=income?`支出率 ${Math.round(expense/income*100)}%`:`支出 ${money(expense)}`;
  $('heroInvestmentRatio').textContent=income?`淨投入／收入 ${Math.round(investment/income*100)}%`:`淨投入 ${(investment<0?'-':'')+money(Math.abs(investment))}`;
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
  const dueDividends=dividendNeedsConfirmation();
  dueDividends.slice(0,2).forEach(e=>items.unshift({icon:'💰',title:`${e.symbol} ${e.shortName||e.name||''} ${e.status==='due'?'今天預計入帳':'待確認入帳'}`,meta:`${e.estimatedAmount==null?'金額待確認':`預估 ${money(e.estimatedAmount)}`} · 預計 ${e.expectedPayDate}`,tone:'income',action:()=>confirmDividendEvent(e.id)}));
  if(!dueDividends.length){
    const horizon=addDaysKey(today,45),events=[];
    dividendEvents.map(e=>dividendDerived(e,today)).filter(e=>!['paid','cancelled'].includes(e.status)).forEach(e=>{
      if(e.exDate&&e.exDate>=today&&e.exDate<=horizon)events.push({date:e.exDate,type:'ex',e});
      if(e.expectedPayDate&&e.expectedPayDate>=today&&e.expectedPayDate<=horizon)events.push({date:e.expectedPayDate,type:'pay',e});
    });
    events.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2).reverse().forEach(({date,type,e})=>{
      const d=parseDateKey(date),n=new Date(),sameMonth=d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth(),prefix=sameMonth?'本月':'接下來',md=`${d.getMonth()+1}/${d.getDate()}`;
      if(type==='ex')items.unshift({icon:'🗓️',title:`${prefix} ${e.symbol} ${e.shortName||e.name||''} 預計在 ${md} 除息`,meta:e.perShare>0?`每股配息 ${e.perShare}`:'配息金額待確認',tone:'info',action:()=>openDividendEventEditor(e.id)});
      else items.unshift({icon:'🧧',title:`${prefix} ${e.symbol} ${e.shortName||e.name||''} 預計在 ${md} 入帳${e.estimatedAmount==null?'':` ${money(e.estimatedAmount)}`}`,meta:'入帳後可一鍵確認並加入收入',tone:'income',action:()=>openDividendEventEditor(e.id)});
    });
  }
  return items.slice(0,5);
}
function renderHomeReminders(){
  const panel=$('homeReminderPanel'),list=$('homeReminderList'),items=collectHomeReminders(); if(!panel||!list)return; panel.classList.toggle('hidden',!items.length); if(!items.length)return; $('homeReminderCount').textContent=String(items.length); $('homeReminderTitle').textContent=items.length===1?'有 1 件事情值得注意':`有 ${items.length} 件事情值得注意`; list.innerHTML='';
  items.forEach(item=>{const b=document.createElement('button');b.className=`reminder-item ${item.tone||''}`;b.innerHTML=`<span class="reminder-icon">${item.icon}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span><b>›</b>`; if(item.action)b.onclick=item.action; else if(item.date)b.onclick=()=>{selectedDate=item.date;viewMonth=startOfMonth(parseDateKey(item.date));renderAll();setTimeout(()=>$('dayListTitle')?.scrollIntoView({behavior:'smooth',block:'center'}),50);}; else b.disabled=true; list.appendChild(b);});
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
  if(t.annualSummary)return `${String(t.date||'').slice(0,4)} 年 · 年度摘要（不建立日現金流）`;
  if(t.type==='income')return `${dateLabel} · ${t.incomeCategory||'其他收入'}`;
  return `${dateLabel} · ${t.investmentCategory||'股票／ETF'} · 投資`;
}
function detailIconByTxn(t){
  if(t.type==='expense')return catIconByTxn(t);
  if(t.type==='income')return {'薪資':'💼','獎金':'🎁','股息':'💹','老婆分紅':'👩‍❤️‍👨','退款':'↩️','其他收入':'💰'}[t.incomeCategory||'其他收入']||'💰';
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
    row.className='txn-row'+(t.virtual?'':' detail-clickable')+(t.pendingAmount?' pending-txn':'');
    if(!t.virtual){row.setAttribute('role','button'); row.tabIndex=0;}
    const cls=t.type==='income'?'income':t.type==='investment'?'investment':'expense';
    const amountText=t.pendingAmount?'待填金額':`${t.type==='expense'?'-':''}${money(t.amount)}`;
    row.innerHTML=`<div class="txn-icon">${detailIconByTxn(t)}</div><div class="txn-main"><strong>${escapeHtml(t.title||state.title||'未命名')}</strong><span>${escapeHtml(detailMetaByTxn(t))}</span>${t.note?`<span class="detail-note">備註：${escapeHtml(t.note)}</span>`:''}</div><div class="txn-amount ${cls}">${amountText}</div><div class="detail-chevron">›</div>`;
    if(!t.virtual){row.onclick=()=>openTxnFromInsight(t.id);row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTxnFromInsight(t.id);}};}
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
  const icons={'薪資':'💼','獎金':'🎁','股息':'💹','老婆分紅':'👩‍❤️‍👨','退款':'↩️','其他收入':'💰'};
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
function annualSummaryVirtualTxns(year){
  const a=annualIncomeSummaries.find(x=>Number(x.year)===Number(year)); if(!a)return [];
  const rows=[];
  if(a.dividendIncome>0)rows.push({id:`annual-${year}-dividend`,date:`${year}-12-31`,type:'income',title:`${year} 年股息收入摘要`,amount:ntd(a.dividendIncome),incomeCategory:'股息',annualSummary:true,virtual:true});
  if(a.spouseBonus>0)rows.push({id:`annual-${year}-spouse`,date:`${year}-12-31`,type:'income',title:`${year} 年老婆分紅摘要`,amount:ntd(a.spouseBonus),incomeCategory:'老婆分紅',annualSummary:true,virtual:true});
  return rows;
}
function analysisPeriodTxns(){
  if(analysisMode==='year'){
    const summary=annualSummaryForYear(analysisYear);let rows=txns.filter(t=>parseDateKey(t.date).getFullYear()===analysisYear);
    if(summary?.dividendIncome>0)rows=rows.filter(t=>!(t.type==='income'&&(t.incomeCategory||'')==='股息'));
    if(summary?.spouseBonus>0)rows=rows.filter(t=>!(t.type==='income'&&(t.incomeCategory||'')==='老婆分紅'));
    return rows.concat(annualSummaryVirtualTxns(analysisYear));
  }
  const mk=`${analysisYear}-${String(analysisMonth+1).padStart(2,'0')}`;
  return txns.filter(t=>String(t.date||'').slice(0,7)===mk);
}
function incomeCategoryTotals(list){ const m=new Map(); for(const t of list){ const k=t.incomeCategory||'其他收入'; m.set(k,(m.get(k)||0)+Number(t.amount||0)); } return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function renderIncomeRanking(list,onRowClick=null){ const box=$('incomeRanking'); box.innerHTML=''; const rows=incomeCategoryTotals(list); $('incomeRankingEmpty').classList.toggle('hidden',rows.length>0); if(!rows.length)return; const total=sum(list)||1,max=rows[0][1]||1; const icons={'薪資':'💼','獎金':'🎁','股息':'💹','老婆分紅':'👩‍❤️‍👨','退款':'↩️','其他收入':'💰'}; for(const [name,val] of rows){ const row=document.createElement(onRowClick?'button':'div'); row.className='analysis-row'+(onRowClick?' is-clickable':''); if(onRowClick)row.type='button'; row.innerHTML=`<div class="income-rank-icon">${icons[name]||'💰'}</div><div class="analysis-main"><div class="topline"><strong>${escapeHtml(name)}</strong><span>${Math.round(val/total*100)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,val/max*100)}%"></div></div></div><div class="analysis-amount">${money(val)}</div>${onRowClick?'<span class="row-chevron">›</span>':''}`; if(onRowClick)row.onclick=()=>onRowClick(name,val); box.appendChild(row); } }
function analysisPeriodDateRange(){
  if(analysisMode==='year')return {start:`${analysisYear}-01-01`,end:`${analysisYear}-12-31`};
  const mm=String(analysisMonth+1).padStart(2,'0'),days=new Date(analysisYear,analysisMonth+1,0).getDate();
  return {start:`${analysisYear}-${mm}-01`,end:`${analysisYear}-${mm}-${String(days).padStart(2,'0')}`};
}
function investmentSellCashForRange(start,end){
  return investmentLedger.filter(t=>!t.voided&&t.kind==='sell'&&String(t.date||'')>=start&&String(t.date||'')<=end).reduce((a,t)=>a+investmentTxnCash(t),0);
}
function monthlyInvestmentNet(d=viewMonth){
  const y=d.getFullYear(),m=d.getMonth(),mm=String(m+1).padStart(2,'0'),days=new Date(y,m+1,0).getDate();
  const buys=sum(investmentsOfMonth(d));
  const sells=investmentSellCashForRange(`${y}-${mm}-01`,`${y}-${mm}-${String(days).padStart(2,'0')}`);
  return {buys,sells,net:buys-sells};
}

function renderAnalysis(){
  $('analysisYearLabel').textContent=`${analysisYear} 年`; $('analysisYearModeBtn').classList.toggle('active',analysisMode==='year'); $('analysisMonthModeBtn').classList.toggle('active',analysisMode==='month'); $('analysisMonthSelect').classList.toggle('hidden',analysisMode!=='month'); $('analysisMonthSelect').value=String(analysisMonth);
  const list=analysisPeriodTxns(), ex=list.filter(t=>t.type==='expense'), inc=list.filter(t=>t.type==='income'), inv=list.filter(t=>t.type==='investment'); const expense=sum(ex),income=sum(inc),net=income-expense;
  const investmentBuys=sum(inv),range=analysisPeriodDateRange(),investmentSells=investmentSellCashForRange(range.start,range.end),investmentNet=investmentBuys-investmentSells;
  $('analysisIncomeLabel').textContent=analysisMode==='year'?'全年收入':'本月收入'; $('analysisExpenseLabel').textContent=analysisMode==='year'?'全年支出':'本月支出'; $('analysisInvestmentLabel').textContent=analysisMode==='year'?'全年投資淨投入':'本月投資淨投入'; $('analysisTotalIncome').textContent=money(income); $('analysisTotalExpense').textContent=money(expense); $('analysisTotalInvestment').textContent=(investmentNet<0?'-':'')+money(Math.abs(investmentNet)); $('analysisInvestmentMeta').textContent=`買進 ${money(investmentBuys)} · 賣出 ${money(investmentSells)}`; $('analysisNetBalance').textContent=(net<0?'-':'')+money(Math.abs(net)); $('analysisNetBalance').style.color=net<0?'var(--expense)':'var(--income)';
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
  const palette=['#e97d72','#f3b45d','#6db69f','#6d8ed6','#a485d6','#95a75c']; const rows=categoryTotals(ex); if(!rows.length){donut.style.background='conic-gradient(#edf0f3 0 100%)';legend.innerHTML='<div class="donut-empty">還沒有支出資料</div>';donut.onclick=null;return;}
  const top=rows.slice(0,5).map(([id,amount])=>({id,label:categoryById(id).name,icon:categoryById(id).icon,amount,items:ex.filter(t=>t.categoryId===id)})); const restIds=rows.slice(5).map(([id])=>id); const other=rows.slice(5).reduce((a,[,v])=>a+v,0); if(other)top.push({id:'__other__',label:'其他',icon:'•••',amount:other,items:ex.filter(t=>restIds.includes(t.categoryId))}); let cursor=0; const stops=[];
  const periodLabel=analysisMode==='year'?`${analysisYear} 年`:`${analysisYear} 年 ${analysisMonth+1} 月`,baseDays=analysisMode==='month'?analysisPeriodDays():0;
  const openSlice=r=>{if(r.id==='__other__')openInsightDetail({title:'其他支出',icon:'•••',lead:'其他支出',periodLabel,items:r.items,baseDays,desc:'查看其餘支出類別的每一筆細項；點一下可再編輯。'});else openExpenseDetailByCategory(r.id,r.label,periodLabel,r.items,baseDays);};
  top.forEach((r,i)=>{const startPct=cursor,endPct=cursor+r.amount/(total||1)*100;r.startPct=startPct;r.endPct=endPct;stops.push(`${palette[i%palette.length]} ${startPct}% ${endPct}%`);cursor=endPct;const item=document.createElement('button');item.type='button';item.className='donut-legend-item is-clickable';item.innerHTML=`<i style="background:${palette[i%palette.length]}"></i><span>${escapeHtml(r.icon)} ${escapeHtml(r.label)}</span><div class="donut-legend-values"><b>${money(r.amount)}</b><strong>${Math.round(r.amount/(total||1)*100)}%</strong></div>`;item.onclick=()=>openSlice(r);legend.appendChild(item);}); donut.style.background=`conic-gradient(${stops.join(',')})`;
  donut.onclick=e=>{const rect=donut.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=e.clientX-cx,dy=e.clientY-cy,dist=Math.hypot(dx,dy);if(dist<rect.width*.30)return;const angle=(Math.atan2(dy,dx)*180/Math.PI+450)%360,pct=angle/3.6;const slice=top.find(r=>pct>=r.startPct&&pct<r.endPct)||top[top.length-1];if(slice)openSlice(slice);};
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


function shiftAnalysisPeriod(direction){
  if(analysisMode==='year'){analysisYear+=direction;renderAnalysis();return;}
  let next=new Date(analysisYear,analysisMonth+direction,1);analysisYear=next.getFullYear();analysisMonth=next.getMonth();renderAnalysis();
}
function installAnalysisSwipe(){
  const el=$('analysisPeriodCard');if(!el)return;let startX=0,startY=0;
  el.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t){startX=t.clientX;startY=t.clientY;}},{passive:true});
  el.addEventListener('touchend',e=>{const t=e.changedTouches?.[0];if(!t)return;const dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)shiftAnalysisPeriod(dx<0?1:-1);},{passive:true});
}
function setPage(page){ if(page==='analysis'){analysisYear=viewMonth.getFullYear();analysisMonth=viewMonth.getMonth();} for(const s of ['homeScreen','budgetScreen','investmentScreen','analysisScreen','investmentHoldingsScreen','investmentIncomeAnalysisScreen','investmentActivityScreen'])hide($(s)); if(page==='budget')show($('budgetScreen')); else if(page==='investment')show($('investmentScreen')); else if(page==='analysis')show($('analysisScreen')); else show($('homeScreen')); document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page)); renderAll(); }
function renderCategoryPicker(){
  ensureSelectedCategory(); const box=$('categoryPicker'); box.innerHTML=''; for(const c of visibleCategories()){ const b=document.createElement('button'); b.type='button'; b.className='category-btn'+(c.id===selectedCategoryId?' active':''); b.innerHTML=`<span>${escapeHtml(c.icon)}</span>${escapeHtml(c.name)}`; b.onclick=()=>{selectedCategoryId=c.id;renderCategoryPicker();renderSubcategories();}; box.appendChild(b); }
}
function renderSubcategories(preferred){
  const c=categoryById(selectedCategoryId),sel=$('subcategoryInput'); sel.innerHTML=''; const subs=(c.subs&&c.subs.length)?c.subs:['其他']; for(const s of subs){ const o=document.createElement('option'); o.value=s;o.textContent=s;sel.appendChild(o); } if(preferred&&subs.includes(preferred))sel.value=preferred; syncSubcategoryPickerLabel();
}
function syncSubcategoryPickerLabel(){const sel=$('subcategoryInput'),value=$('subcategoryPickerValue');if(value&&sel)value.textContent=sel.value||'請選擇';}
function recentSubcategoryUsage(categoryId,subs){
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-120);const cutoffKey=dateKey(cutoff),counts=new Map(subs.map(s=>[s,0]));
  txns.filter(t=>t.type==='expense'&&t.categoryId===categoryId&&String(t.date||'')>=cutoffKey).forEach(t=>{if(counts.has(t.subcategory))counts.set(t.subcategory,counts.get(t.subcategory)+1);});
  return {counts,ordered:subs.slice().sort((a,b)=>(counts.get(b)-counts.get(a))||subs.indexOf(a)-subs.indexOf(b))};
}
function openSubcategoryPicker(){
  const c=categoryById(selectedCategoryId),box=$('subcategoryChoices');if(!c||!box)return;$('subcategorySheetTitle').textContent=`${c.icon} ${c.name} · 細分類`;box.innerHTML='';const usage=recentSubcategoryUsage(c.id,(c.subs&&c.subs.length)?c.subs:['其他']),subs=usage.ordered,current=$('subcategoryInput').value;
  subs.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='subcategory-choice'+(s===current?' active':'');b.innerHTML=`<span>${escapeHtml(s)}</span>${i<3&&usage.counts.get(s)>0?'<small>常用</small>':''}`;b.onclick=()=>{$('subcategoryInput').value=s;syncSubcategoryPickerLabel();hide($('subcategorySheet'));};box.appendChild(b);});show($('subcategorySheet'));
}
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
  const linked=txn?bookkeepingLinkTarget(txn):null;if(txn&&isCompletedInvestmentBuy(linked)){hide($('txnMenuScreen'));hide($('recurringEditScopeScreen'));actionTxnId=null;openInvestmentTxnEditor(linked.id);return;}
  editingId=txn?.id||null; $('editorTitle').textContent=editingId?'編輯':'記一筆'; show($('editorScreen')); $('voiceResultCard').classList.toggle('hidden',!transcript); $('voiceTranscript').textContent=transcript||'';
  setEditType(txn?.type||'expense'); $('amountInput').value=txn?.pendingAmount?'':(txn?.amount||''); currentCalcExpression=''; hide($('amountCalcHint')); $('amountCalcHint').textContent=''; $('dateInput').value=txn?.date||date||dateKey(new Date()); updateEditorDateContext(); $('titleInput').value=txn?.title||''; $('noteInput').value=txn?.note||'';
  const baseDay=parseDateKey($('dateInput').value).getDate();
  $('editorRecurringInput').checked=false; $('editorRecurringFields').classList.add('hidden'); $('editorRecurringFrequency').value='monthly'; $('editorRecurringMonthlyDayInput').value=''; setEditorMonthlyDays([baseDay]); $('editorRecurringEndDate').value=''; $('editorPendingAmountInput').checked=false; updateEditorRecurringVisibility(); updateEditorRecurringHint();
  if((txn?.type||'expense')==='expense'){ selectedCategoryId=txn?.categoryId||'food'; ensureSelectedCategory(); renderCategoryPicker(); renderSubcategories(txn?.subcategory); setPayment(txn?.payment||'card'); }
  $('incomeCategoryInput').value=txn?.incomeCategory||'薪資'; $('investmentCategoryInput').value=txn?.investmentCategory||'股票／ETF'; $('bookkeepingInvestmentSymbolInput').value=txn?.investmentSymbol||inferInvestmentSymbolFromText(`${txn?.title||''} ${txn?.note||''}`)||'';
}
function updateEditorDateContext(){ const v=$('dateInput').value; if(!v)return; const d=parseDateKey(v); $('editorDateContext').textContent=`記錄日期：${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日`; updateEditorRecurringHint(); }
function closeEditor(){ hide($('editorScreen')); editingId=null; }
async function saveTxn(){
  const amount=ntd($('amountInput').value||0),date=$('dateInput').value||dateKey(new Date()),title=$('titleInput').value.trim(),wasEditing=!!editingId;
  const makeRecurring=!editingId&&$('editorRecurringInput').checked; const pending=makeRecurring&&$('editorPendingAmountInput').checked;
  if(!pending&&!(amount>0)){toast('請輸入金額');return;} if(makeRecurring&&!title){toast('週期紀錄請填寫內容名稱');return;}
  if(makeRecurring){
    const endDate=$('editorRecurringEndDate').value||''; if(endDate&&endDate<date){toast('結束日期不能早於開始日期');return;}
    const start=parseDateKey(date),frequency=$('editorRecurringFrequency').value;
    const r={id:uid(),type:editType,title,amount:pending?0:amount,pendingAmount:pending,frequency,monthlyDays:frequency==='monthly'?collectEditorMonthlyDays(start.getDate()):undefined,dayOfMonth:start.getDate(),dayOfWeek:start.getDay(),monthOfYear:start.getMonth()+1,dayOfYear:start.getDate(),startDate:date,endDate,skipDates:[],enabled:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    if(editType==='income')r.incomeCategory=$('incomeCategoryInput').value; else if(editType==='investment'){r.investmentCategory=$('investmentCategoryInput').value;r.investmentSymbol=investmentAssetKey($('bookkeepingInvestmentSymbolInput').value)||inferInvestmentSymbolFromText(title);const meta=r.investmentSymbol?await resolveSecurityMeta(r.investmentSymbol).catch(()=>cachedSecurityMeta(r.investmentSymbol)):null;r.investmentName=meta?.name||'';} else{r.categoryId=selectedCategoryId;r.subcategory=$('subcategoryInput').value;r.payment=selectedPayment;}
    recurring.push(r); await processRecurringDue(false); await persistState(); selectedDate=date; viewMonth=startOfMonth(start); closeEditor(); renderAll(); toast(pending?'週期提醒已建立，屆期再填金額':editType==='investment'?'定期投資已建立':'週期紀錄已建立'); return;
  }
  const old=txns.find(t=>t.id===editingId); const base={id:editingId||uid(),type:editType,amount,date,title,note:$('noteInput').value.trim(),updatedAt:new Date().toISOString()};
  if(old?.recurringId)base.recurringId=old.recurringId; if(old?.recurringKey)base.recurringKey=old.recurringKey; if(old?.sourceRecurringPending)base.sourceRecurringPending=true;
  let rec=base; if(editType==='expense')rec={...base,categoryId:selectedCategoryId,subcategory:$('subcategoryInput').value,payment:selectedPayment}; if(editType==='income')rec={...base,incomeCategory:$('incomeCategoryInput').value}; if(editType==='investment'){const symbol=investmentAssetKey($('bookkeepingInvestmentSymbolInput').value)||inferInvestmentSymbolFromText(`${title} ${base.note}`),meta=symbol?await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol)):null;rec={...base,investmentCategory:$('investmentCategoryInput').value,investmentSymbol:symbol,investmentName:meta?.name||old?.investmentName||''};}
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
function editOccurrenceOnly(){ const t=txns.find(x=>x.id===actionTxnId),linked=bookkeepingLinkTarget(t); hide($('recurringEditScopeScreen')); actionTxnId=null; if(isCompletedInvestmentBuy(linked)){openInvestmentTxnEditor(linked.id);return;} if(t)openEditor(t); }
function editRecurringFromOccurrence(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t?.recurringId)return closeRecurringEditScope();
  const occurrence=recurringOccurrenceDate(t),rid=t.recurringId; hide($('recurringEditScopeScreen')); actionTxnId=null;
  openRecurringEditor(rid,{splitSourceId:rid,effectiveFrom:occurrence});
}
function recurringOccurrenceDate(t){ const prefix=t?.recurringId?`${t.recurringId}:`:''; return t?.recurringKey?.startsWith(prefix)?t.recurringKey.slice(prefix.length):(t?.date||''); }
function linkedInvestmentImpactText(t){
  const l=bookkeepingLinkTarget(t);if(!l)return '';
  const label=`${l.symbol||l.shortName||l.name||'投資'} ${investmentKindLabel(l.kind)}`;
  if(isCompletedInvestmentBuy(l))return `\n\n⚠️ 此筆已連結正式投資交易「${label}」。刪除記帳後，股數、成交價、手續費與持股成本資料也會一併刪除。`;
  if(l.kind==='dividend')return `\n\n此筆已連結投資帳本「${label}」，投資頁股息也會一併刪除。`;
  if(l.kind==='contribution')return `\n\n此筆已連結投資帳本待補成交資料「${label}」，投資頁也會一併刪除。`;
  return '';
}
function recurringRemovalInvestmentSummary(t,fromHere=false){
  if(!t?.recurringId)return '';
  const occurrence=recurringOccurrenceDate(t),rows=txns.filter(x=>x.recurringId===t.recurringId&&(!fromHere||!occurrence||recurringOccurrenceDate(x)>=occurrence));
  const linked=rows.map(x=>bookkeepingLinkTarget(x)).filter(Boolean),formal=linked.filter(isCompletedInvestmentBuy).length,others=linked.length-formal;
  if(!linked.length)return '';
  return `\n\n⚠️ 這個操作會同步移除 ${linked.length} 筆投資帳本資料${formal?`，其中 ${formal} 筆已補齊正式成交資訊`:''}${others?`，另有 ${others} 筆待補／股息資料`:''}。`;
}
async function deleteTxn(){
  if(!actionTxnId)return; const t=txns.find(x=>x.id===actionTxnId); if(!t)return;
  if(t.recurringId){ hide($('txnMenuScreen')); $('recurringDeleteHint').textContent=`${t.title||'這筆紀錄'}：之前已經發生的週期紀錄都會保留。${linkedInvestmentImpactText(t)}${recurringRemovalInvestmentSummary(t,true)}`; show($('recurringDeleteScreen')); return; }
  if(!confirm(`確定刪除這筆紀錄？${linkedInvestmentImpactText(t)}`))return; txns=txns.filter(x=>x.id!==actionTxnId); await persistState(); closeTxnMenu(); renderAll(); toast('已刪除');
}
function closeRecurringDelete(){ hide($('recurringDeleteScreen')); actionTxnId=null; }
async function deleteOccurrenceOnly(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t)return closeRecurringDelete(); if(!confirm(`確定只刪除這一筆？${linkedInvestmentImpactText(t)}`))return; const occurrence=recurringOccurrenceDate(t),r=recurring.find(x=>x.id===t.recurringId);
  if(r){ if(!Array.isArray(r.skipDates))r.skipDates=[]; if(occurrence&&!r.skipDates.includes(occurrence))r.skipDates.push(occurrence); }
  txns=txns.filter(x=>x.id!==t.id); await persistState(); closeRecurringDelete(); renderAll(); toast('只刪除這一筆，之後週期照常');
}
async function stopRecurringFromOccurrence(){
  const t=txns.find(x=>x.id===actionTxnId); if(!t)return closeRecurringDelete(); if(!confirm(`確定從這一筆開始停止後續週期？${recurringRemovalInvestmentSummary(t,true)}`))return; const occurrence=recurringOccurrenceDate(t),r=recurring.find(x=>x.id===t.recurringId);
  if(r&&occurrence)r.cancelFromDate=occurrence;
  txns=txns.filter(x=>{ if(x.recurringId!==t.recurringId)return true; const od=recurringOccurrenceDate(x); return !occurrence||od<occurrence; });
  await persistState(); closeRecurringDelete(); renderAll(); toast('已從這一筆開始停止後續週期');
}
function openBudgetEditor(){ const box=$('budgetEditorList'); box.innerHTML=''; for(const item of budgetRows()){ const label=document.createElement('label'); label.textContent=`${item.icon} ${item.label}`; const input=document.createElement('input'); input.type='number';input.inputMode='numeric';input.min='0';input.step='100';input.dataset.budgetKey=item.key;input.value=budgetValue(item.key)||'';input.placeholder='未設定';box.append(label,input); } show($('budgetEditorScreen')); }
async function saveBudgetEditor(){ document.querySelectorAll('#budgetEditorList input[data-budget-key]').forEach(i=>{const v=ntd(i.value||0);if(v>0)budgets[i.dataset.budgetKey]=v;else delete budgets[i.dataset.budgetKey];}); await persistState(); hide($('budgetEditorScreen')); renderAll(); toast('預算已儲存'); }

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
  if(/學費|補習|才藝|課程|小孩用品|女兒|孩子|小孩/.test(t)&&!/吃|餐|飯|壽司|火鍋|燒肉/.test(t))return {categoryId:'family',subcategory:/學費|補習|才藝|課程/.test(t)?'子女教育':'子女用品'};
  if(/水費|電費|瓦斯/.test(t))return {categoryId:'home',subcategory:'水電瓦斯'}; if(/電話|網路|手機費/.test(t))return {categoryId:'home',subcategory:'電話網路'}; if(/全聯|家樂福|costco|好市多|日用品|衛生紙/.test(t))return {categoryId:'home',subcategory:'日用品'};
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
function saveVoiceDraftItemEdit(){const item=voiceDraftItems[voiceDraftEditingIndex];if(!item)return;const amount=ntd($('voiceDraftEditAmount').value||0),title=$('voiceDraftEditTitle').value.trim(),date=$('voiceDraftEditDate').value;if(!(amount>0)||!date){toast('請填金額與日期');return;}item.amount=amount;item.title=title||'未命名';item.date=date;item.components=[{title:item.title,amount}];if(item.type==='expense'){item.categoryId=$('voiceDraftEditCategory').value;item.subcategory=$('voiceDraftEditSubcategory').value;item.payment=$('voiceDraftEditPayment').value;}else if(item.type==='income')item.incomeCategory=$('voiceDraftEditIncomeCategory').value;else item.investmentCategory=$('voiceDraftEditInvestmentCategory').value;hide($('voiceDraftEditScreen'));renderVoiceDrafts();}
function openVoiceDrafts(items){ closeVoiceSheet(false); voiceDraftItems=items; renderVoiceDrafts(); show($('voiceDraftScreen')); }
function closeVoiceDrafts(){ hide($('voiceDraftScreen')); voiceDraftItems=[]; }
async function saveVoiceDrafts(){
  if(!voiceDraftItems.length)return; const now=new Date().toISOString();
  for(const item of voiceDraftItems){ const base={id:uid(),type:item.type,amount:ntd(item.amount||0),date:item.date,title:item.title||'未命名',note:'',createdAt:now,updatedAt:now,pendingAmount:false}; let rec=base; if(item.type==='expense')rec={...base,categoryId:item.categoryId||'other',subcategory:item.subcategory||'其他',payment:item.payment||'card'}; else if(item.type==='income')rec={...base,incomeCategory:item.incomeCategory||'其他收入'}; else rec={...base,investmentCategory:item.investmentCategory||'股票／ETF',investmentSymbol:inferInvestmentSymbolFromText(item.title||'')}; txns.push(rec); }
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
  const base={id:`planned:${r.id}:${dk}`,planned:true,type:r.type,amount:pending?0:ntd(r.amount||0),pendingAmount:pending,date:dk,title:r.title,recurringId:r.id,recurringKey:`${r.id}:${dk}`};
  if(r.type==='income')return {...base,incomeCategory:r.incomeCategory||'其他收入'};
  if(r.type==='investment')return {...base,investmentCategory:r.investmentCategory||'股票／ETF',investmentSymbol:investmentAssetKey(r.investmentSymbol)||inferInvestmentSymbolFromText(r.title),investmentName:r.investmentName||''};
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
      const pending=!!r.pendingAmount; const base={id:uid(),type:r.type,amount:pending?0:ntd(r.amount||0),pendingAmount:pending,sourceRecurringPending:pending,date:dk,title:r.title,note:pending?'週期提醒・待填金額':'週期紀錄自動補登',recurringId:r.id,recurringKey:rk,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      let rec=base; if(r.type==='income')rec={...base,incomeCategory:r.incomeCategory||'其他收入'}; else if(r.type==='investment')rec={...base,investmentCategory:r.investmentCategory||'股票／ETF',investmentSymbol:investmentAssetKey(r.investmentSymbol)||inferInvestmentSymbolFromText(r.title),investmentName:r.investmentName||''}; else rec={...base,categoryId:r.categoryId||'other',subcategory:r.subcategory||'其他',payment:r.payment||'card'};
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
  const r=id?recurring.find(x=>x.id===id):null; $('recurringEditorTitle').textContent=recurringSplitEffectiveDate?`從 ${recurringSplitEffectiveDate} 起修改週期`:r?'編輯週期紀錄':'新增週期紀錄'; setRecurringType(r?.type||'expense'); $('recurringTitleInput').value=r?.title||''; $('recurringAmountInput').value=r?.pendingAmount?'':(r?.amount||''); $('recurringPendingAmountInput').checked=!!r?.pendingAmount; $('recurringFrequencyInput').value=r?.frequency||'monthly'; $('recurringMonthlyDayInput').value=''; setRecurringMonthlyDaysDraft(r?.monthlyDays||[r?.dayOfMonth||5]); $('recurringDayOfMonthInput').value=r?.dayOfMonth||5; $('recurringDayOfWeekInput').value=String(r?.dayOfWeek??1); $('recurringMonthOfYearInput').value=r?.monthOfYear||1; $('recurringDayOfYearInput').value=r?.dayOfYear||1; $('recurringStartDateInput').value=recurringSplitEffectiveDate||r?.startDate||dateKey(new Date()); $('recurringStartDateInput').disabled=!!recurringSplitEffectiveDate; $('recurringEndDateInput').value=r?.endDate||''; $('recurringIncomeCategoryInput').value=r?.incomeCategory||'薪資'; $('recurringInvestmentCategoryInput').value=r?.investmentCategory||'股票／ETF'; $('recurringInvestmentSymbolInput').value=r?.investmentSymbol||inferInvestmentSymbolFromText(r?.title||'')||''; $('recurringEnabledInput').checked=r?.enabled!==false; renderRecurringCategoryOptions(r?.categoryId); if(r?.subcategory)renderRecurringSubcategories(r.subcategory); setRecurringPayment(r?.payment||'card'); updateRecurringFrequencyFields(); show($('recurringEditorScreen'));
}
async function saveRecurring(){
  const title=$('recurringTitleInput').value.trim(),amount=ntd($('recurringAmountInput').value||0),pending=$('recurringPendingAmountInput').checked,startDate=$('recurringStartDateInput').value,endDate=$('recurringEndDateInput').value||'',frequency=$('recurringFrequencyInput').value;
  if(!title||!startDate||(!pending&&!(amount>0))){toast(pending?'請填名稱與開始日期':'請填名稱、金額與開始日期');return;} if(endDate&&endDate<startDate){toast('結束日期不能早於開始日期');return;}
  const start=parseDateKey(startDate),old=recurring.find(x=>x.id===recurringEditingId);
  const splitMode=!!recurringSplitSourceId&&!!recurringSplitEffectiveDate;
  const r={id:splitMode?uid():(recurringEditingId||uid()),type:recurringType,title,amount:pending?0:amount,pendingAmount:pending,frequency,monthlyDays:frequency==='monthly'?collectRecurringMonthlyDays(start.getDate()):(old?.monthlyDays||undefined),dayOfMonth:Number($('recurringDayOfMonthInput').value||start.getDate()),dayOfWeek:Number($('recurringDayOfWeekInput').value||start.getDay()),monthOfYear:Number($('recurringMonthOfYearInput').value||start.getMonth()+1),dayOfYear:Number($('recurringDayOfYearInput').value||start.getDate()),startDate,endDate,skipDates:splitMode?[]:(Array.isArray(old?.skipDates)?old.skipDates:[]),cancelFromDate:splitMode?'':(old?.cancelFromDate||''),enabled:$('recurringEnabledInput').checked,updatedAt:new Date().toISOString()};
  if(recurringType==='income')r.incomeCategory=$('recurringIncomeCategoryInput').value; else if(recurringType==='investment'){r.investmentCategory=$('recurringInvestmentCategoryInput').value;r.investmentSymbol=investmentAssetKey($('recurringInvestmentSymbolInput').value)||inferInvestmentSymbolFromText(title);const meta=r.investmentSymbol?await resolveSecurityMeta(r.investmentSymbol).catch(()=>cachedSecurityMeta(r.investmentSymbol)):null;r.investmentName=meta?.name||'';} else{r.categoryId=$('recurringCategoryInput').value;r.subcategory=$('recurringSubcategoryInput').value;r.payment=recurringPayment;}
  r.createdAt=splitMode?new Date().toISOString():(old?.createdAt||new Date().toISOString());
  if(splitMode){
    const affected=txns.filter(x=>x.recurringId===recurringSplitSourceId&&recurringOccurrenceDate(x)>=recurringSplitEffectiveDate),linked=affected.map(x=>bookkeepingLinkTarget(x)).filter(Boolean),formal=linked.filter(isCompletedInvestmentBuy).length;
    if(linked.length&&!confirm(`從 ${recurringSplitEffectiveDate} 起套用新設定，會重建之後的週期紀錄。

⚠️ 目前將移除 ${linked.length} 筆已連動投資資料${formal?`，其中 ${formal} 筆已補齊正式成交資訊`:''}。確定繼續？`))return;
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
async function saveQuickTemplate(){const name=$('quickTemplateNameInput').value.trim(),icon=$('quickTemplateIconInput').value.trim()||'⚡',type=$('quickTemplateTypeInput').value,amount=ntd($('quickTemplateAmountInput').value||0);if(!name){toast('請輸入模板名稱');return;}let q={id:quickTemplateEditingId||uid(),name,icon,type,amount};if(type==='expense')q={...q,categoryId:$('quickTemplateCategoryInput').value,subcategory:$('quickTemplateSubcategoryInput').value,payment:$('quickTemplatePaymentInput').value};else if(type==='income')q={...q,incomeCategory:$('quickTemplateIncomeCategoryInput').value};else q={...q,investmentCategory:$('quickTemplateInvestmentCategoryInput').value};if(quickTemplateEditingId)quickTemplates=quickTemplates.map(x=>x.id===quickTemplateEditingId?q:x);else quickTemplates.push(q);await persistState();hide($('quickTemplateEditorScreen'));renderQuickTemplateManager();renderQuickTemplateStrip();toast('快速模板已儲存');}
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
  $('setupMessage').textContent='正在建立安全儲存…'; const salt=randomBytes(16); authConfig={pinSalt:bytesToB64(salt),pinHash:await derivePinVerifier(pin,salt),faceEnabled:false,createdAt:new Date().toISOString()}; saveAuthConfig(); await createRecoverableMasterKey(pin); unlocked=true; await loadVault();
  if($('setupFaceCheck').checked){ try{await registerFaceId();}catch(e){console.warn(e);toast('Face ID 尚未啟用，可稍後在設定裡再開啟',3000);} }
  unlockAppUi();
}
async function unlockWithPin(){
  const pin=normalizePin($('pinUnlockInput').value); if(!validPin(pin)){ $('unlockMessage').textContent='請輸入 6 位數密碼';return;}
  $('unlockMessage').textContent='驗證中…'; if(!await verifyPin(pin)){ $('unlockMessage').textContent='密碼不正確';$('pinUnlockInput').value='';return;}
  try{
    const needsMigration=!authConfig.masterKeyWrapped;
    if(needsMigration)$('unlockMessage').textContent='正在升級安全儲存，請稍候…';
    await ensureRecoverableKeyAfterPin(pin);
    await completeUnlock();
    if(needsMigration)toast('安全儲存已升級，可用密碼復原金鑰',3000);
  }catch(e){
    console.error(e);
    if(e?.message==='LEGACY_DEVICE_KEY_MISSING'||e?.message==='DEVICE_KEY_MISSING')$('unlockMessage').textContent='安全金鑰已遺失，為避免覆寫舊資料，App 已停止建立新金鑰。請使用先前備份還原。';
    else $('unlockMessage').textContent='安全儲存升級失敗，資料未被覆寫，請重新整理後再試';
  }
}
function updatePinUnlockState(){ const input=$('pinUnlockInput'),btn=$('pinUnlockBtn'); if(!input||!btn)return; const ready=validPin(normalizePin(input.value)); btn.disabled=!ready; btn.setAttribute('aria-disabled',String(!ready)); if(ready&&$('unlockMessage').textContent==='請輸入 6 位數密碼')$('unlockMessage').textContent=''; }
async function unlockWithFace(){
  try{
    if(!authConfig.masterKeyWrapped){$('unlockMessage').textContent='新版安全儲存需先用 6 位數密碼解鎖一次，之後即可繼續使用 Face ID。';return;}
    if(!await dbGet(DEVICE_KEY_ID)){$('unlockMessage').textContent='裝置安全金鑰需要復原，請用 6 位數密碼解鎖一次。';return;}
    $('unlockMessage').textContent='請完成 Face ID 驗證';await authenticateFaceId();await completeUnlock();
  }catch(e){console.warn(e);$('unlockMessage').textContent='Face ID 未完成，可改用密碼';}
}
async function completeUnlock(){ unlocked=true; try{await loadVault(); unlockAppUi();}catch(e){console.error(e);unlocked=false;$('unlockMessage').textContent='資料解鎖失敗，請重新整理再試';} }
function unlockAppUi(){ document.body.classList.remove('locked'); hide($('lockScreen')); $('app').setAttribute('aria-hidden','false'); $('pinUnlockInput').value=''; updatePinUnlockState(); $('unlockMessage').textContent=''; renderCategoryPicker(); renderSubcategories(); renderAll(); refreshSecurityUi(); showPostUpdateNotice(); setTimeout(()=>syncOfficialDividendCalendar({silent:true}),0); }
function lockApp(reason='background'){
  if(!unlocked)return; collapseVoiceFab(); stopVoiceSession(); const inInvestmentSub=['investmentHoldingsScreen','investmentIncomeAnalysisScreen','investmentActivityScreen'].some(id=>$(id)&&!$(id).classList.contains('hidden')); if(inInvestmentSub){['investmentHoldingsScreen','investmentIncomeAnalysisScreen','investmentActivityScreen'].forEach(id=>hide($(id)));show($('investmentScreen'));} ['editorScreen','calculatorScreen','voiceSheet','voiceDraftScreen','voiceDraftEditScreen','txnMenuScreen','budgetEditorScreen','investmentTxnEditorScreen','investmentPendingScreen','investmentQuoteEditorScreen','investmentMarketOverviewScreen','dividendEventEditorScreen','annualSummaryEditorScreen','investmentSecurityDetailScreen','investmentRealizedScreen','investmentHoldingsScreen','investmentIncomeAnalysisScreen','investmentActivityScreen','settingsScreen','securityScreen','quickTemplateManagerScreen','quickTemplateEditorScreen','insightDetailScreen','categoryManagerScreen','categoryEditorScreen','recurringManagerScreen','recurringEditorScreen','recurringDeleteScreen'].forEach(id=>hide($(id))); unlocked=false;vaultLoaded=false;txns=[];budgets={};categories=clone(DEFAULT_CATEGORIES);quickTemplates=clone(DEFAULT_QUICK_TEMPLATES);settings={};recurring=[];investmentLedger=[];investmentQuotes=[];dividendEvents=[];annualIncomeSummaries=[];dividendEventEditingId=null;annualSummaryEditingYear=null;investmentDetailSymbol=null;investmentValuesVisible=false; document.body.classList.add('locked'); show($('lockScreen')); show($('unlockPanel')); hide($('setupPanel')); $('app').setAttribute('aria-hidden','true'); updatePinUnlockState(); refreshLockFaceUi();
}
async function refreshLockFaceUi(){ const yes=!!authConfig.faceEnabled&&!!authConfig.faceCredentialId&&await isFaceAvailable(); $('faceUnlockBtn').classList.toggle('hidden',!yes); $('faceDivider').classList.toggle('hidden',!yes); }
async function refreshSecurityUi(){ if(!$('faceStatusText'))return; const avail=await isFaceAvailable(); if(authConfig.faceEnabled&&authConfig.faceCredentialId){$('faceStatusText').textContent='已啟用。離開 App 後，回來可用 Face ID 重新解鎖。';$('toggleFaceBtn').textContent='重新設定 Face ID';}else{$('faceStatusText').textContent=avail?'尚未啟用。':'此裝置／瀏覽器目前無法使用平台生物辨識。';$('toggleFaceBtn').textContent='啟用 Face ID';$('toggleFaceBtn').disabled=!avail;} }
async function changePin(){
  const oldPinRaw=prompt('請先輸入目前的 6 位數密碼'); if(oldPinRaw===null)return; const oldPin=normalizePin(oldPinRaw);
  if(!await verifyPin(oldPin)){toast('目前密碼不正確');return;}
  const p1=prompt('請輸入新的 6 位數密碼');if(p1===null)return;const pin=normalizePin(p1);if(!validPin(pin)){toast('新密碼必須是 6 位數');return;}
  const p2=prompt('請再輸入一次新密碼');if(normalizePin(p2)!==pin){toast('兩次新密碼不一致');return;}
  try{
    await ensureRecoverableKeyAfterPin(oldPin);
    const raw=await unwrapMasterKeyBytes(authConfig.masterKeyWrapped,oldPin);
    const newWrapped=await wrapMasterKeyBytes(raw,pin),salt=randomBytes(16);
    authConfig.pinSalt=bytesToB64(salt);authConfig.pinHash=await derivePinVerifier(pin,salt);authConfig.masterKeyWrapped=newWrapped;saveAuthConfig();toast('密碼已變更，安全金鑰復原資料已同步更新');
  }catch(e){console.error(e);toast('密碼變更失敗，原密碼與資料均未變更',3000);}
}

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


// ===== V1.4.3 記帳 ↔ 投資安全雙向聯動 =====
function inferInvestmentSymbolFromText(text){
  const raw=String(text||'').toUpperCase();
  const m=raw.match(/(?:^|[^0-9A-Z])(\d{4,6}[A-Z]?)(?=$|[^0-9A-Z])/);
  return m?.[1]||'';
}
function bookkeepingInvestmentSymbol(t){
  return investmentAssetKey(t?.investmentSymbol||inferInvestmentSymbolFromText(`${t?.title||''} ${t?.note||''}`));
}
function bookkeepingInvestmentName(t){ return String(t?.investmentName||'').trim(); }
function bookkeepingLinkTarget(t){
  if(!t)return null;
  return investmentLedger.find(x=>x.id===t.investmentLedgerId)||investmentLedger.find(x=>x.bookkeepingTxnId===t.id)||null;
}
function reconcileInvestmentLinks(){
  if(!Array.isArray(txns)||!Array.isArray(investmentLedger))return;
  const txById=new Map(txns.map(t=>[t.id,t]));

  // 記帳刪除時只移除真正依附記帳的紀錄；正式買進在 UI 已先告知連動影響。
  investmentLedger=investmentLedger.filter(l=>!l.bookkeepingTxnId||txById.has(l.bookkeepingTxnId));

  for(const t of txns){
    if(!t?.id)continue;
    let linked=bookkeepingLinkTarget(t);
    const formalBuy=isCompletedInvestmentBuy(linked)&&linked.ownedBy==='investment';

    // 完成成交後由投資帳本成為權威來源：普通記帳不得把代號、金額、日期拆開改壞。
    if(formalBuy){
      linked.bookkeepingTxnId=t.id;t.investmentLedgerId=linked.id;
      t.type='investment';t.date=linked.date;t.amount=ntd(investmentTxnCash(linked));t.investmentCategory='股票／ETF';t.investmentSymbol=linked.symbol;t.investmentName=linked.name||'';t.title=`${linked.symbol||linked.shortName||linked.name||'投資'} 買進`;t.note=linked.note||'';t.pendingAmount=false;t.source='investment-ledger';
      continue;
    }

    const isInvestment=t.type==='investment'&&ntd(t.amount||0)>0&&!isHistoricalSummary(t);
    const isDividend=t.type==='income'&&(t.incomeCategory||'')==='股息'&&ntd(t.amount||0)>0&&!isHistoricalSummary(t);

    if(!isInvestment&&!isDividend){
      if(linked){ investmentLedger=investmentLedger.filter(x=>x.id!==linked.id); }
      if(t.investmentLedgerId)delete t.investmentLedgerId;
      continue;
    }

    const explicitSymbol=bookkeepingInvestmentSymbol(t);
    if(isDividend&&!linked&&!explicitSymbol)continue;

    if(!linked){
      const meta=explicitSymbol?cachedSecurityMeta(explicitSymbol):null;
      linked={
        id:uid(),kind:isDividend?'dividend':'contribution',symbol:explicitSymbol,name:bookkeepingInvestmentName(t)||meta?.name||'',shortName:meta?.shortName||'',securityType:meta?.securityType||'',title:String(t.title||'').trim(),date:t.date||dateKey(new Date()),quantity:0,price:0,fee:0,tax:0,amount:ntd(t.amount||0),note:String(t.note||'').trim(),ownedBy:isDividend?'shared':'bookkeeping',status:isDividend?'complete':'pending',feeMode:'auto',taxMode:'auto',createdAt:t.createdAt||new Date().toISOString(),bookkeepingTxnId:t.id,source:'bookkeeping'
      };
      investmentLedger.push(linked);
    }

    linked.bookkeepingTxnId=t.id;t.investmentLedgerId=linked.id;
    linked.date=t.date||linked.date||dateKey(new Date());linked.note=String(t.note||'').trim();linked.title=String(t.title||'').trim();linked.amount=ntd(t.amount||0);
    if(explicitSymbol){linked.symbol=explicitSymbol;t.investmentSymbol=explicitSymbol;const meta=cachedSecurityMeta(explicitSymbol);if(meta){linked.name=bookkeepingInvestmentName(t)||meta.name;linked.shortName=meta.shortName;linked.securityType=meta.securityType;}else if(bookkeepingInvestmentName(t))linked.name=bookkeepingInvestmentName(t);}

    if(isDividend){
      linked.kind='dividend';linked.quantity=0;linked.price=0;linked.fee=0;linked.tax=0;linked.ownedBy='shared';linked.status='complete';
    }else{
      linked.kind='contribution';linked.quantity=0;linked.price=0;linked.fee=0;linked.tax=0;linked.ownedBy='bookkeeping';linked.status='pending';
    }
  }

  // 同一 bookkeepingTxnId 僅允許一筆子紀錄，優先保留雙方互指者。
  const grouped=new Map();
  for(const l of investmentLedger){if(!l.bookkeepingTxnId)continue;if(!grouped.has(l.bookkeepingTxnId))grouped.set(l.bookkeepingTxnId,[]);grouped.get(l.bookkeepingTxnId).push(l);}
  for(const [txnId,rows] of grouped){if(rows.length<=1)continue;const t=txById.get(txnId),keep=rows.find(r=>r.id===t?.investmentLedgerId)||rows.find(isCompletedInvestmentBuy)||rows[0];investmentLedger=investmentLedger.filter(r=>r.bookkeepingTxnId!==txnId||r.id===keep.id);if(t)t.investmentLedgerId=keep.id;}

  // 股息生命週期與正式收入也維持雙向：記帳頁改日期／金額會回寫實際入帳；刪除收入則撤銷「已入帳」，但保留原除息提醒。
  if(!Array.isArray(dividendEvents))dividendEvents=[];
  const ledgerById=new Map(investmentLedger.map(l=>[l.id,l]));
  dividendEvents=dividendEvents.filter(e=>{
    if(!e.ledgerTxnId)return true;
    const l=ledgerById.get(e.ledgerTxnId);
    if(l&&l.kind==='dividend'){e.symbol=l.symbol||e.symbol;e.name=l.name||e.name;e.shortName=l.shortName||e.shortName;e.securityType=l.securityType||e.securityType;e.actualPayDate=l.date;e.actualAmount=ntd(l.amount||0);e.bookkeepingTxnId=l.bookkeepingTxnId||null;e.note=l.note||e.note;return true;}
    if(e.exDate||e.expectedPayDate){e.actualPayDate='';e.actualAmount=null;e.ledgerTxnId=null;e.bookkeepingTxnId=null;return true;}
    return false;
  });
  const eventLedgerIds=new Set(dividendEvents.map(e=>e.ledgerTxnId).filter(Boolean));
  for(const l of investmentLedger.filter(x=>x.kind==='dividend'&&!eventLedgerIds.has(x.id))){dividendEvents.push({id:uid(),symbol:l.symbol,name:l.name||'',shortName:l.shortName||'',securityType:l.securityType||'',exDate:'',expectedPayDate:l.date,actualPayDate:l.date,perShare:0,actualAmount:ntd(l.amount||0),statusOverride:'',note:l.note||'',createdAt:l.createdAt||new Date().toISOString(),bookkeepingTxnId:l.bookkeepingTxnId||null,ledgerTxnId:l.id});}
}

// ===== V1.4.0 投資帳本 =====
function investmentMoney(n){ return '$'+ntd(n).toLocaleString('zh-TW'); }
function investmentPrice(n){ const v=Number(n||0); return '$'+v.toLocaleString('zh-TW',{minimumFractionDigits:0,maximumFractionDigits:4}); }
function investmentPct(n){
  if(!Number.isFinite(n))return '--'; return `${n>=0?'+':''}${(n*100).toFixed(2)}%`;
}
function investmentAssetKey(symbol){return String(symbol||'').trim().toUpperCase();}
const SECURITY_SEED={
  '00406A':{name:'主動中信台灣收益',shortName:'中信台灣收益',securityType:'etf',market:'TWSE'},
  '0050':{name:'元大台灣50',shortName:'台灣50',securityType:'etf',market:'TWSE'},
  '0056':{name:'元大高股息',shortName:'高股息',securityType:'etf',market:'TWSE'},
  '00878':{name:'國泰永續高股息',shortName:'永續高股息',securityType:'etf',market:'TWSE'},
  '00919':{name:'群益台灣精選高息',shortName:'精選高息',securityType:'etf',market:'TWSE'},
  '00929':{name:'復華台灣科技優息',shortName:'科技優息',securityType:'etf',market:'TWSE'},
  '00981A':{name:'主動統一台股增長',shortName:'台股增長',securityType:'etf',market:'TWSE'},
  '00937B':{name:'群益ESG投等債20+',shortName:'ESG投等債20+',securityType:'bond-etf',market:'TPEx'},
  '2330':{name:'台積電',shortName:'台積電',securityType:'stock',market:'TWSE'},
  '6446':{name:'藥華藥',shortName:'藥華藥',securityType:'stock',market:'TWSE'}
};
const SECURITY_CACHE_TTL_MS=7*24*60*60*1000;
let securityDirectoryPromise=null,securityDirectoryLoadedAt=0,securityLookupTimer=null,securityCachePersistTimer=null;
function investmentFeeConfig(){ return {...DEFAULT_INVESTMENT_FEE_CONFIG,...(settings.investmentFeeConfig||{})}; }
function investmentDisplayLabel(symbol,name='',shortName=''){
  const key=investmentAssetKey(symbol),label=String(name||shortName||key).trim();
  return key&&label&&label!==key?`${key} ${label}`:(key||label);
}
function investmentPrivateMoney(value){return investmentValuesVisible?investmentMoney(value):'****';}
function investmentPrivatePct(value){return investmentValuesVisible?investmentPct(value):'****';}
function setInvestmentValuesVisible(visible){
  investmentValuesVisible=!!visible;
  renderInvestment();
  if(investmentDetailSymbol&&$('investmentSecurityDetailScreen')&&!$('investmentSecurityDetailScreen').classList.contains('hidden'))renderInvestmentSecurityDetail();
}
function toggleInvestmentValuesVisible(){setInvestmentValuesVisible(!investmentValuesVisible);}
function investmentSecurityCache(){ if(!settings.investmentSecurityCache||typeof settings.investmentSecurityCache!=='object')settings.investmentSecurityCache={}; return settings.investmentSecurityCache; }
function securityCacheFresh(meta){
  if(!meta)return false;
  const ts=Date.parse(meta.updatedAt||'');
  return Number.isFinite(ts)&&(Date.now()-ts)<SECURITY_CACHE_TTL_MS;
}
function queueSecurityCachePersist(){
  clearTimeout(securityCachePersistTimer);
  securityCachePersistTimer=setTimeout(()=>{if(unlocked&&vaultLoaded)persistState().catch(e=>console.warn('persist security cache',e));},500);
}
function shortenSecurityName(name,symbol=''){
  let out=String(name||'').trim(); if(!out)return investmentAssetKey(symbol);
  out=out.replace(/^主動/,'');
  for(const issuer of ['元大','富邦','國泰','群益','復華','中信','統一','野村','凱基','兆豐','第一金','永豐','大華','台新','新光']){if(out.startsWith(issuer)&&out.length>issuer.length+1){out=out.slice(issuer.length);break;}}
  return out.length>10?out.slice(0,10):out;
}
function guessSecurityType(symbol,name='',hint=''){
  const key=investmentAssetKey(symbol),text=`${name} ${hint}`;
  if(/債.*ETF|ETF.*債|投等債|公司債|公債|債券/.test(text))return 'bond-etf';
  if(/ETF|基金/.test(text)||/^00/.test(key))return 'etf';
  return 'stock';
}
function normalizeSecurityMeta(meta,symbol){
  const key=investmentAssetKey(symbol),name=String(meta?.name||meta?.fullName||'').trim(),securityType=meta?.securityType||guessSecurityType(key,name,meta?.sourceType||'');
  return {symbol:key,name:name||key,shortName:String(meta?.shortName||'').trim()||shortenSecurityName(name||key,key),securityType,market:meta?.market||'',source:meta?.source||'',updatedAt:meta?.updatedAt||new Date().toISOString()};
}
function securityMetaResolved(meta,symbol){
  const key=investmentAssetKey(symbol),name=String(meta?.name||meta?.fullName||'').trim();
  return !!key&&!!name&&name!==key&&meta?.source!=='unresolved';
}
function cachedSecurityMeta(symbol){
  const key=investmentAssetKey(symbol); if(!key)return null;
  const cache=investmentSecurityCache(),cached=cache[key];
  if(cached&&securityMetaResolved(cached,key))return normalizeSecurityMeta(cached,key);
  // 舊版本曾把「查不到名稱」的代號本身寫進快取；這種資料不可當成有效名稱。
  if(cached&&!securityMetaResolved(cached,key)){delete cache[key];queueSecurityCachePersist();}
  return SECURITY_SEED[key]?normalizeSecurityMeta({...SECURITY_SEED[key],source:'seed'},key):null;
}
function pickField(obj,names){for(const n of names){if(obj&&obj[n]!=null&&String(obj[n]).trim())return String(obj[n]).trim();}return '';}
function parseSecurityRows(rows,{market='',sourceType='',source='official'}={}){
  const out=[]; for(const r of Array.isArray(rows)?rows:[]){
    const symbol=investmentAssetKey(pickField(r,['Code','證券代號','公司代號','股票代號','SecuritiesCompanyCode','SecuritiesCode','SecurityCode','代號','基金代號'])); if(!symbol)continue;
    const name=pickField(r,['Name','證券名稱','證券簡稱','公司簡稱','公司名稱','股票名稱','CompanyName','SecuritiesCompanyName','SecuritiesName','SecurityName','基金簡稱','基金名稱','中文簡稱','中文名稱']); if(!name)continue;
    out.push(normalizeSecurityMeta({name,market,sourceType,source,securityType:sourceType==='fund'?'etf':undefined},symbol));
  } return out;
}
async function fetchJsonWithTimeout(url,ms=4500){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),ms);try{const r=await fetch(url,{cache:'no-store',signal:ctrl.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}finally{clearTimeout(timer);}}
const STATIC_SECURITY_MASTER_URL='./data/security-master.json';
const STATIC_LATEST_QUOTES_URL='./data/latest-quotes.json';
const STATIC_DIVIDEND_CALENDAR_URL='./data/dividend-calendar.json';
let marketSnapshotPromise=null,marketSnapshotLoadedAt=0;

async function fetchStaticJson(relativeUrl,ms=8000){
  const url=new URL(relativeUrl,document.baseURI);
  return await fetchJsonWithTimeout(url.toString(),ms);
}
async function loadSecurityDirectory({force=false}={}){
  if(!force&&securityDirectoryPromise&&Date.now()-securityDirectoryLoadedAt<10*60*1000)return securityDirectoryPromise;
  securityDirectoryLoadedAt=Date.now();
  securityDirectoryPromise=(async()=>{
    const map=new Map(Object.entries(SECURITY_SEED).map(([k,v])=>[k,normalizeSecurityMeta({...v,source:'seed'},k)]));
    const data=await fetchStaticJson(STATIC_SECURITY_MASTER_URL,8000);
    const rows=Array.isArray(data)?data:(Array.isArray(data?.items)?data.items:[]);
    for(const r of rows){
      const symbol=investmentAssetKey(r.symbol||r.Code||r['證券代號']);
      const name=String(r.name||r.Name||r['證券名稱']||'').trim();
      if(!symbol||!name)continue;
      map.set(symbol,normalizeSecurityMeta({
        name,
        shortName:r.shortName||'',
        market:r.market||'',
        securityType:r.securityType||guessSecurityType(symbol,name,r.sourceType||''),
        source:'GitHub Pages 證券主檔',
        updatedAt:data?.generatedAt||new Date().toISOString()
      },symbol));
    }
    return map;
  })().catch(e=>{
    console.warn('static security directory',e);
    return new Map(Object.entries(SECURITY_SEED).map(([k,v])=>[k,normalizeSecurityMeta({...v,source:'seed'},k)]));
  });
  return securityDirectoryPromise;
}
async function resolveSecurityMeta(symbol,{force=false}={}){
  const key=investmentAssetKey(symbol);if(!key)return null;
  const cache=investmentSecurityCache(),seed=SECURITY_SEED[key];
  let cached=cache[key];
  // 只有「真正有中文名稱」的快取才允許短路。舊版 unresolved（name===symbol）必須淘汰，
  // 否則即使 GitHub Pages 主檔已經有 00713/2002，也會被 7 天快取擋住。
  if(cached&&!securityMetaResolved(cached,key)){delete cache[key];cached=null;queueSecurityCachePersist();}
  if(!force&&cached&&securityCacheFresh(cached)&&securityMetaResolved(cached,key))return normalizeSecurityMeta(cached,key);
  if(!force&&!cached&&seed){
    const normalized=normalizeSecurityMeta({...seed,source:'seed'},key);
    cache[key]=normalized;queueSecurityCachePersist();return normalized;
  }
  try{
    let directory=await loadSecurityDirectory({force}),found=directory.get(key);
    // 若剛好在 GitHub Actions 更新後仍握有舊的 10 分鐘記憶體主檔，
    // 第一次查不到時立刻強制重讀一次，避免只有 bootstrap 代號可辨識。
    if(!found&&!force){
      securityDirectoryPromise=null;securityDirectoryLoadedAt=0;
      directory=await loadSecurityDirectory({force:true});
      found=directory.get(key);
    }
    if(found&&found.name&&found.name!==key){
      const normalized=normalizeSecurityMeta({...found,updatedAt:new Date().toISOString()},key);
      cache[key]=normalized;queueSecurityCachePersist();return normalized;
    }
  }catch(e){console.warn('security directory',key,e);}
  if(cached)return normalizeSecurityMeta(cached,key);
  if(seed)return normalizeSecurityMeta({...seed,source:'seed'},key);
  return normalizeSecurityMeta({name:key,securityType:guessSecurityType(key,''),source:'unresolved'},key);
}
async function loadStaticMarketSnapshot({force=false}={}){
  if(!force&&marketSnapshotPromise&&Date.now()-marketSnapshotLoadedAt<2*60*1000)return marketSnapshotPromise;
  marketSnapshotLoadedAt=Date.now();
  marketSnapshotPromise=(async()=>{
    const data=await fetchStaticJson(STATIC_LATEST_QUOTES_URL,8000);
    const items=Array.isArray(data)?data:(Array.isArray(data?.items)?data.items:[]);
    return {generatedAt:data?.generatedAt||'',latestTradeDate:data?.latestTradeDate||'',items,indices:Array.isArray(data?.indices)?data.indices:[]};
  })();
  return marketSnapshotPromise;
}
async function loadStaticDividendCalendar(){
  const data=await fetchStaticJson(STATIC_DIVIDEND_CALENDAR_URL,8000);
  return {generatedAt:data?.generatedAt||'',items:Array.isArray(data?.items)?data.items:[],sources:Array.isArray(data?.sources)?data.sources:[],warnings:Array.isArray(data?.warnings)?data.warnings:[]};
}
function officialDividendEventKey(x){return `${investmentAssetKey(x?.symbol)}|${String(x?.exDate||'')}`;}
async function syncOfficialDividendCalendar({force=false,silent=true}={}){
  if(dividendCalendarSyncInFlight)return dividendCalendarSyncInFlight;
  const task=(async()=>{
    const today=dateKey(new Date());
    try{
      const calendar=await loadStaticDividendCalendar();
      if(!settings.dividendAutoStartDate)settings.dividendAutoStartDate=today;
      const autoStart=String(settings.dividendAutoStartDate||today);
      const existingByKey=new Map(dividendEvents.filter(e=>e.exDate).map((e,i)=>[officialDividendEventKey(e),i]));
      let changed=0,created=0,updated=0,frozen=0;
      for(const row of calendar.items){
        const symbol=investmentAssetKey(row?.symbol),exDate=String(row?.exDate||''),recordDate=String(row?.recordDate||''),officialPay=String(row?.expectedPayDate||'');
        if(!symbol||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(exDate))continue;
        const key=`${symbol}|${exDate}`,idx=existingByKey.get(key),prior=idx==null?null:dividendEvents[idx];
        if(!prior&&exDate<autoStart)continue;
        let entitledShares=prior?.entitledShares==null||prior?.entitledShares===''?null:Number(prior.entitledShares),entitlementFrozenAt=String(prior?.entitlementFrozenAt||'');
        if(entitledShares==null&&today>=exDate){entitledShares=investmentSharesAsOf(symbol,investmentPreviousDayKey(exDate));entitlementFrozenAt=today;if(entitledShares>0)frozen++;}
        const currentShares=investmentSharesAsOf(symbol,today);
        if(!prior&&((today>=exDate&&!(entitledShares>0))||(today<exDate&&!(currentShares>0))))continue;
        const rowPerShare=row?.perShare==null||row?.perShare===''?null:Number(row.perShare),priorPerShare=Number(prior?.perShare||0);
        const meta=cachedSecurityMeta(symbol),next={
          ...(prior||{}),id:prior?.id||`auto-dividend-${symbol}-${exDate}`,symbol,name:String(row?.name||prior?.name||meta?.name||symbol),shortName:prior?.shortName||meta?.shortName||shortenSecurityName(row?.name||symbol,symbol),securityType:String(row?.securityType||prior?.securityType||meta?.securityType||guessSecurityType(symbol,row?.name||'')),
          exDate,recordDate:recordDate||prior?.recordDate||'',expectedPayDate:officialPay||prior?.expectedPayDate||'',actualPayDate:prior?.actualPayDate||'',perShare:Number.isFinite(rowPerShare)?Math.max(0,rowPerShare):priorPerShare,actualAmount:prior?.actualAmount??null,entitledShares,entitlementFrozenAt,
          source:prior?.source&&prior.source!=='official-auto'?prior.source:'official-auto',sourceProvider:String(row?.source||prior?.sourceProvider||''),sourceUrl:String(row?.sourceUrl||prior?.sourceUrl||''),sourceUpdatedAt:calendar.generatedAt||new Date().toISOString(),statusOverride:prior?.statusOverride||'',note:prior?.note||'官方股息行事曆自動同步；實際入帳需人工確認',createdAt:prior?.createdAt||new Date().toISOString(),bookkeepingTxnId:prior?.bookkeepingTxnId||null,ledgerTxnId:prior?.ledgerTxnId||null
        };
        const before=prior?JSON.stringify(prior):'';
        if(prior){if(JSON.stringify(next)!==before){dividendEvents[idx]=next;changed++;updated++;}}
        else{existingByKey.set(key,dividendEvents.length);dividendEvents.push(next);changed++;created++;}
      }
      settings.dividendCalendarGeneratedAt=calendar.generatedAt||settings.dividendCalendarGeneratedAt||'';
      settings.dividendLastSyncAt=new Date().toISOString();
      settings.dividendLastSyncError='';
      settings.dividendLastSyncStats={created,updated,frozen};
      if(changed||force)await persistState(); else await persistState();
      if(unlocked&&vaultLoaded)renderAll();
      if(!silent)toast(changed?`股息行事曆已更新：新增 ${created}、更新 ${updated}`:'股息行事曆已是最新');
      return {changed,created,updated,frozen,generatedAt:calendar.generatedAt};
    }catch(e){
      console.warn('dividend calendar sync',e);settings.dividendLastSyncAt=new Date().toISOString();settings.dividendLastSyncError=String(e?.message||e);if(unlocked&&vaultLoaded){await persistState().catch(()=>{});renderDividendCalendar();}if(!silent)toast('股息行事曆暫時無法更新，會保留既有資料',2600);return {error:e};
    }finally{dividendCalendarSyncInFlight=null;}
  })();
  dividendCalendarSyncInFlight=task;return task;
}
function securityTaxRate(meta,date=dateKey(new Date())){
  const type=meta?.securityType||guessSecurityType(meta?.symbol||'',meta?.name||'');
  if(type==='bond-etf')return date<='2026-12-31'?0:0.001;
  if(type==='etf')return 0.001;
  return 0.003;
}
function calcRegularFee(gross){const g=ntd(gross);if(g<=0)return 0;const c=investmentFeeConfig();return Math.max(ntd(c.regularMinFee),ntd(g*Number(c.regularRate)*Number(c.regularDiscount)));}
function ledgerIsRecurring(t){const b=t?.bookkeepingTxnId?txns.find(x=>x.id===t.bookkeepingTxnId):null;return !!b?.recurringId;}
function calcAutoInvestmentCosts({kind,quantity,price,symbol,name,securityType,date,recurring=false}){
  const gross=ntd(Math.max(0,Number(quantity||0)*Number(price||0))),meta=normalizeSecurityMeta({name:name||symbol,securityType:securityType||guessSecurityType(symbol,name)},symbol);
  const fee=['buy','sell'].includes(kind)?(recurring&&kind==='buy'?ntd(investmentFeeConfig().recurringFee):calcRegularFee(gross)):0;
  const tax=kind==='sell'?ntd(gross*securityTaxRate(meta,date)):0;
  return {gross,fee,tax,meta};
}
function isCompletedInvestmentBuy(l){return !!l&&l.kind==='buy'&&Number(l.quantity)>0&&Number(l.price)>0&&l.status!=='pending';}
function investmentKindLabel(k){return ({initial:'初始持股',buy:'買進',sell:'賣出',dividend:'股息',contribution:'投入'})[k]||k;}
function investmentKindIcon(k){return ({initial:'📌',buy:'🟣',sell:'🔵',dividend:'💰',contribution:'🟪'})[k]||'📈';}
function investmentTxnCash(t){
  if(t.kind==='initial')return ntd(Math.max(0,Number(t.quantity||0)*Number(t.price||0)));
  if(t.kind==='buy')return ntd(Math.max(0,Number(t.quantity||0)*Number(t.price||0)+Number(t.fee||0)));
  if(t.kind==='contribution')return ntd(Math.max(0,Number(t.amount||0)));
  if(t.kind==='sell')return ntd(Math.max(0,Number(t.quantity||0)*Number(t.price||0)-Number(t.fee||0)-Number(t.tax||0)));
  if(t.kind==='dividend')return ntd(Math.max(0,Number(t.amount||0)));
  return 0;
}
function investmentPreviousDayKey(key){return addDaysKey(key,-1);}
function ledgerSort(rows){return rows.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt||'').localeCompare(String(b.createdAt||''))||String(a.id||'').localeCompare(String(b.id||'')));}
function validateInvestmentLedger(rows=investmentLedger){
  const qty=new Map(),issues=[];
  for(const t of ledgerSort(rows)){
    if(!t.symbol||t.kind==='contribution'||t.kind==='dividend')continue;
    const key=investmentAssetKey(t.symbol),available=Number(qty.get(key)||0),q=Math.max(0,Number(t.quantity||0));
    if(t.kind==='initial'||t.kind==='buy'){qty.set(key,available+q);continue;}
    if(t.kind==='sell'){
      if(q>available+1e-8){issues.push({type:'oversell',id:t.id,symbol:key,date:t.date,requested:q,available});continue;}
      qty.set(key,Math.max(0,available-q));
    }
  }
  return issues;
}
function investmentHealthIssues(){return validateInvestmentLedger(investmentLedger);}
function investmentSharesAsOf(symbol,asOf){
  const key=investmentAssetKey(symbol); if(!key||!asOf)return 0;
  const p=investmentPortfolio(asOf).positions.find(x=>x.symbol===key); return Math.max(0,Number(p?.quantity||0));
}
function dividendDerived(e,today=dateKey(new Date())){
  const entitlementDate=e.exDate?investmentPreviousDayKey(e.exDate):(e.actualPayDate||e.expectedPayDate||today);
  const frozen=Number.isFinite(Number(e.entitledShares))&&e.entitledShares!==null&&e.entitledShares!==''?Math.max(0,Number(e.entitledShares)):null;
  const entitledShares=frozen==null?(e.exDate?investmentSharesAsOf(e.symbol,entitlementDate):0):frozen;
  const estimatedAmount=e.perShare>0&&e.exDate?ntd(entitledShares*Number(e.perShare||0)):null;
  let status='planned';
  if(e.statusOverride==='cancelled')status='cancelled';
  else if(e.actualPayDate&&e.actualAmount!=null)status='paid';
  else if(e.expectedPayDate&&e.expectedPayDate<today)status='overdue';
  else if(e.expectedPayDate===today)status='due';
  else if(e.exDate&&e.exDate<=today)status='exed';
  return {...e,entitlementDate,entitledShares,estimatedAmount,status};
}
function dividendStatusLabel(status){return ({planned:'預定',exed:'已除息／待入帳',due:'今天預計入帳',overdue:'待確認入帳',paid:'已入帳',cancelled:'已取消'})[status]||status;}
function dividendStatusIcon(status){return ({planned:'🗓️',exed:'⏳',due:'💰',overdue:'🔔',paid:'✅',cancelled:'⛔'})[status]||'💰';}
function annualSummaryForYear(year){return annualIncomeSummaries.find(x=>Number(x.year)===Number(year))||null;}
function detailedDividendIncomeForYear(year){
  return investmentLedger.filter(t=>t.kind==='dividend'&&Number(String(t.date).slice(0,4))===Number(year)).reduce((sum,t)=>sum+investmentTxnCash(t),0);
}
function annualDividendDisplay(year){const a=annualSummaryForYear(year);return a?ntd(a.dividendIncome):detailedDividendIncomeForYear(year);}
function allRecordedDividendIncome(){
  const summaryYears=new Set(annualIncomeSummaries.filter(a=>Number(a.dividendIncome)>0).map(a=>Number(a.year)));
  const detailed=investmentLedger.filter(t=>t.kind==='dividend'&&!summaryYears.has(Number(String(t.date||'').slice(0,4)))).reduce((sum,t)=>sum+investmentTxnCash(t),0);
  const annual=annualIncomeSummaries.reduce((sum,a)=>sum+ntd(a.dividendIncome||0),0);
  return ntd(detailed+annual);
}
function detailedSpouseBonusForYear(year){
  return txns.filter(t=>!t.voided&&t.type==='income'&&(t.incomeCategory||'')==='老婆分紅'&&Number(String(t.date||'').slice(0,4))===Number(year)).reduce((sum,t)=>sum+ntd(t.amount||0),0);
}
function investmentYearlyIncomeBreakdown(year){
  const y=Number(year),summary=annualSummaryForYear(y);
  const dividend=summary?ntd(summary.dividendIncome||0):detailedDividendIncomeForYear(y);
  const spouse=summary?ntd(summary.spouseBonus||0):detailedSpouseBonusForYear(y);
  return {year:y,dividend,spouse,total:ntd(dividend+spouse),source:summary?'annual':'detail'};
}
function monthStartKey(monthValue){return /^\d{4}-\d{2}$/.test(String(monthValue||''))?`${monthValue}-01`:'';}
function monthEndKey(monthValue){
  if(!/^\d{4}-\d{2}$/.test(String(monthValue||'')))return'';const [y,m]=monthValue.split('-').map(Number);return dateKey(new Date(y,m,0));
}
function investmentIncomeForRange(start,end){
  if(!start||!end||start>end)return {dividend:0,spouse:0,total:0,warnings:['期間設定不正確']};
  let dividend=0,spouse=0;const warnings=[];const sy=Number(start.slice(0,4)),ey=Number(end.slice(0,4));
  for(let y=sy;y<=ey;y++){
    const ys=`${y}-01-01`,ye=`${y}-12-31`,from=start>ys?start:ys,to=end<ye?end:ye,summary=annualSummaryForYear(y),fullYear=from===ys&&to===ye;
    if(summary&&fullYear){dividend+=ntd(summary.dividendIncome||0);spouse+=ntd(summary.spouseBonus||0);continue;}
    dividend+=investmentLedger.filter(t=>!t.voided&&t.kind==='dividend'&&t.date>=from&&t.date<=to).reduce((sum,t)=>sum+investmentTxnCash(t),0);
    spouse+=txns.filter(t=>!t.voided&&t.type==='income'&&(t.incomeCategory||'')==='老婆分紅'&&t.date>=from&&t.date<=to).reduce((sum,t)=>sum+ntd(t.amount||0),0);
    if(summary&&!fullYear)warnings.push(`${y} 年只有年度摘要；部分月份無法精確拆分，這段期間只計入現有逐筆資料。`);
  }
  return {dividend:ntd(dividend),spouse:ntd(spouse),total:ntd(dividend+spouse),warnings};
}
function investmentIncomeYears(){
  const years=new Set(annualIncomeSummaries.map(a=>Number(a.year)));
  investmentLedger.filter(t=>t.kind==='dividend').forEach(t=>years.add(Number(String(t.date||'').slice(0,4))));
  txns.filter(t=>t.type==='income'&&(t.incomeCategory||'')==='老婆分紅').forEach(t=>years.add(Number(String(t.date||'').slice(0,4))));
  years.add(new Date().getFullYear());return [...years].filter(Number.isFinite).sort((a,b)=>a-b);
}
function investmentYearInvestStats(year){
  const rows=investmentLedger.filter(t=>!t.voided&&Number(String(t.date||'').slice(0,4))===Number(year)&&t.kind==='buy');
  return {amount:ntd(rows.reduce((sum,t)=>sum+investmentTxnCash(t),0)),count:rows.length,symbols:new Set(rows.map(t=>t.symbol).filter(Boolean)).size,rows};
}
function cumulativeRealizedAsOf(asOf){
  const rows=investmentRealizedTransactions({asOf});if(rows.some(x=>x.incomplete))return null;return ntd(rows.reduce((sum,x)=>sum+Number(x.realized||0),0));
}
function investmentRealizedForYear(year){
  const rows=investmentRealizedTransactions({year:Number(year)});if(rows.some(x=>x.incomplete))return null;return ntd(rows.reduce((sum,x)=>sum+Number(x.realized||0),0));
}
function investmentVisibilitySvg(visible){
  return visible
    ?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5.4 0 9 5 9 5a15.5 15.5 0 0 1-2.1 2.7M6.6 6.6C4.3 8.1 3 10 3 10s3.6 5 9 5c1.1 0 2.1-.2 3-.5"/></svg>'
    :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>';
}
function setInvestmentGainTone(el,value){
  if(!el)return;el.classList.remove('investment-gain','investment-loss','negative');if(!Number.isFinite(Number(value))||Number(value)===0)return;el.classList.add(Number(value)>0?'investment-gain':'investment-loss');
}
function dividendUpcoming(days=30){
  const today=dateKey(new Date()),end=addDaysKey(today,days);
  return dividendEvents.map(e=>dividendDerived(e,today)).filter(e=>!['paid','cancelled'].includes(e.status)&&e.expectedPayDate&&e.expectedPayDate>=today&&e.expectedPayDate<=end).sort((a,b)=>a.expectedPayDate.localeCompare(b.expectedPayDate));
}
function dividendNeedsConfirmation(){
  const today=dateKey(new Date()); return dividendEvents.map(e=>dividendDerived(e,today)).filter(e=>['due','overdue'].includes(e.status)).sort((a,b)=>a.expectedPayDate.localeCompare(b.expectedPayDate));
}
function upsertInvestmentQuote(q){
  const symbol=investmentAssetKey(q.symbol),date=q.date,priceType=q.priceType||'close'; if(!symbol||!date||!(Number(q.price)>0))return null;
  const idx=investmentQuotes.findIndex(x=>investmentAssetKey(x.symbol)===symbol&&x.date===date&&(x.priceType||'close')===priceType);
  const item={...(idx>=0?investmentQuotes[idx]:{}),...q,id:idx>=0?investmentQuotes[idx].id:(q.id||uid()),symbol,price:Number(q.price),date,priceType,createdAt:idx>=0?(investmentQuotes[idx].createdAt||new Date().toISOString()):(q.createdAt||new Date().toISOString()),updatedAt:new Date().toISOString()};
  if(idx>=0)investmentQuotes[idx]=item;else investmentQuotes.push(item); return item;
}
function rocDateToIso(v){const s=String(v||'').replace(/\D/g,'');if(s.length<7)return'';const y=Number(s.slice(0,3))+1911;return `${y}-${s.slice(3,5)}-${s.slice(5,7)}`;}
function twseRowDateToIso(v){const parts=String(v||'').trim().split('/').map(Number);if(parts.length!==3)return'';const y=parts[0]<1911?parts[0]+1911:parts[0];return `${y}-${String(parts[1]).padStart(2,'0')}-${String(parts[2]).padStart(2,'0')}`;}
function ymdNoDash(d=new Date()){return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;}
async function fetchLatestCompletedClose(meta,symbol){
  const today=dateKey(new Date()),key=investmentAssetKey(symbol),market=meta?.market||cachedSecurityMeta(key)?.market||'TWSE';
  if(market==='TPEx'){
    const rows=await fetchJsonWithTimeout('https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes',7000);
    const r=(Array.isArray(rows)?rows:[]).find(x=>investmentAssetKey(x.SecuritiesCompanyCode||x.Code||x['證券代號'])===key); if(!r)throw new Error('no quote');
    const dt=rocDateToIso(r.Date||r['日期']),price=Number(String(r.Close||r['收盤']||r['收盤價']||'').replace(/,/g,'')); if(!(price>0)||!dt)throw new Error('bad quote');
    // 自動估值只採「今天以前」的完整收盤資料；若官方端點已切到今日收盤，留待下一交易日再納入。
    if(dt>=today)throw new Error('latest TPEx close is not prior trading day');
    return {symbol:key,name:meta?.name||'',price,date:dt,priceType:'close',source:'TPEx'};
  }
  const fetchMonth=async d=>{
    const url=`https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${ymdNoDash(d)}&stockNo=${encodeURIComponent(key)}&response=json`;
    const data=await fetchJsonWithTimeout(url,7000),rows=Array.isArray(data?.data)?data.data:[];
    return rows.map(r=>({date:twseRowDateToIso(r[0]),price:Number(String(r[6]||'').replace(/,/g,''))})).filter(r=>r.date&&r.price>0&&r.date<today);
  };
  let parsed=await fetchMonth(new Date());
  // 每月第一個交易日前，當月尚無「前一交易日」資料，改查前一個月。
  if(!parsed.length){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);parsed=await fetchMonth(d);}
  parsed.sort((a,b)=>b.date.localeCompare(a.date));
  if(!parsed.length)throw new Error('no completed close'); return {symbol:key,name:meta?.name||'',price:parsed[0].price,date:parsed[0].date,priceType:'close',source:'TWSE'};
}
function staticSnapshotQuoteMap(snapshot,items){
  const wanted=new Set(items.map(x=>investmentAssetKey(x.symbol))),out=new Map();
  for(const r of Array.isArray(snapshot?.items)?snapshot.items:[]){
    const symbol=investmentAssetKey(r.symbol||r.Code||r['證券代號']);
    const price=Number(r.close||r.price||r.ClosingPrice||r.Close||0);
    const date=String(r.date||'').slice(0,10);
    if(!wanted.has(symbol)||!(price>0)||!/^\d{4}-\d{2}-\d{2}$/.test(date))continue;
    const name=String(r.name||'').trim();
    out.set(symbol,{
      symbol,name,price,date,priceType:'close',
      market:r.market||'',
      previousClose:Number(r.previousClose||0)||0,
      change:Number(r.change||0)||0,
      changePct:Number(r.changePct||0)||0,
      source:'GitHub Pages 每日收盤檔',
      generatedAt:snapshot?.generatedAt||''
    });
    if(name){
      const cache=investmentSecurityCache();
      cache[symbol]=normalizeSecurityMeta({
        name,market:r.market||'',securityType:r.securityType||guessSecurityType(symbol,name),
        source:'GitHub Pages 每日收盤檔',updatedAt:new Date().toISOString()
      },symbol);
      queueSecurityCachePersist();
    }
  }
  return out;
}
async function fetchStaticLatestSnapshot(items,{force=false}={}){
  const snapshot=await loadStaticMarketSnapshot({force});
  return {snapshot,quotes:staticSnapshotQuoteMap(snapshot,items)};
}
async function ensureLatestClosePrices({force=false}={}){
  if(autoQuoteRefreshInFlight)return;
  const pf=investmentPortfolio(dateKey(new Date())),symbols=[...new Set(pf.active.map(p=>p.symbol))];
  if(!symbols.length)return;
  const today=dateKey(new Date());
  settings.investmentAutoCloseChecked=settings.investmentAutoCloseChecked&&typeof settings.investmentAutoCloseChecked==='object'?settings.investmentAutoCloseChecked:{};
  const targets=symbols.filter(s=>force||settings.investmentAutoCloseChecked[s]!==today);
  if(!targets.length)return;
  autoQuoteRefreshInFlight=true;let changed=false,touched=false;
  try{
    const items=[];
    for(const symbol of targets)items.push({symbol,meta:await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol)||{market:'TWSE'})});
    try{
      const {quotes}=await fetchStaticLatestSnapshot(items,{force});
      for(const {symbol,meta} of items){
        const q=quotes.get(symbol);
        if(q){
          upsertInvestmentQuote({...q,name:meta?.name||q.name||'',fetchedAt:new Date().toISOString()});
          changed=true;
        }
        settings.investmentAutoCloseChecked[symbol]=today;touched=true;
      }
    }catch(e){
      console.warn('static latest close',e);
      for(const {symbol} of items){settings.investmentAutoCloseChecked[symbol]=today;touched=true;}
    }
    if(touched)await persistState();
    if(changed)renderInvestment();
  }finally{autoQuoteRefreshInFlight=false;}
}
function parseMisLivePrice(r){
  const direct=Number(String(r?.z||'').replace(/,/g,''));if(direct>0)return direct;
  for(const key of ['a','b']){
    const first=String(r?.[key]||'').split('_').map(x=>Number(String(x).replace(/,/g,''))).find(x=>x>0);
    if(first>0)return first;
  }
  return 0;
}
function misMarketDate(r){
  const d=String(r?.d||'');return d.length===8?`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`:'';
}
function investmentCloseQuoteOn(symbol,date){
  const key=investmentAssetKey(symbol);
  return investmentQuotes.find(q=>investmentAssetKey(q.symbol)===key&&q.date===date&&(q.priceType||'close')==='close')||null;
}
function investmentManualQuoteChecks(){
  if(!settings.investmentManualQuoteChecks||typeof settings.investmentManualQuoteChecks!=='object')settings.investmentManualQuoteChecks={};
  return settings.investmentManualQuoteChecks;
}

function marketSignedClass(value){const n=Number(value||0);return n>0?'market-up':n<0?'market-down':'market-flat';}
function marketSigned(value,digits=2){const n=Number(value||0);if(!Number.isFinite(n))return '--';return `${n>0?'+':''}${n.toLocaleString('zh-TW',{minimumFractionDigits:digits,maximumFractionDigits:digits})}`;}
function marketPriceText(value){const n=Number(value||0);if(!(n>0))return '--';return n.toLocaleString('zh-TW',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});}
function marketIndexCardHtml(index){
  if(!index)return `<div class="market-index-card missing"><span>大盤</span><strong>尚無資料</strong><small>等待下一次每日行情更新</small></div>`;
  const change=Number(index.change||0),pct=Number(index.changePct||0),cls=marketSignedClass(change);
  return `<div class="market-index-card"><span>${escapeHtml(index.name||index.code||'大盤')}</span><strong>${marketPriceText(index.value)}</strong><small class="${cls}">${marketSigned(change,2)} · ${marketSigned(pct,2)}%</small><em>${escapeHtml(index.date||'')}</em></div>`;
}
async function renderInvestmentMarketOverview({force=false}={}){
  const status=$('investmentMarketOverviewStatus'),indices=$('investmentMarketIndexGrid'),list=$('investmentMarketHoldingsList');
  if(!status||!indices||!list)return;
  status.textContent='正在讀取每日行情檔…';indices.innerHTML='';list.innerHTML='';
  try{
    const snapshot=await loadStaticMarketSnapshot({force});
    const indexMap=new Map((snapshot.indices||[]).map(x=>[String(x.code||x.market||'').toUpperCase(),x]));
    indices.innerHTML=marketIndexCardHtml(indexMap.get('TAIEX')||indexMap.get('TWSE'))+marketIndexCardHtml(indexMap.get('OTC')||indexMap.get('TPEX'));
    const pf=investmentPortfolio(dateKey(new Date())),staticMap=new Map((snapshot.items||[]).map(x=>[investmentAssetKey(x.symbol),x]));
    const rows=[];
    for(const p of pf.active){
      const symbol=investmentAssetKey(p.symbol),r=staticMap.get(symbol),local=investmentLatestQuote(symbol,dateKey(new Date())),meta=cachedSecurityMeta(symbol)||{};
      const price=Number(r?.close||r?.price||local?.price||0),date=String(r?.date||local?.date||''),change=Number(r?.change||local?.change||0),pct=Number(r?.changePct||local?.changePct||0),cls=marketSignedClass(change);
      rows.push(`<div class="market-holding-row"><div><strong>${escapeHtml(symbol)} ${escapeHtml(r?.name||p.name||meta.name||'')}</strong><span>${escapeHtml(date||'尚無日期')} · ${escapeHtml(r?.market||meta.market||'')}</span></div><div class="market-holding-price"><strong>${marketPriceText(price)}</strong><span class="${cls}">${marketSigned(change,2)}${Number.isFinite(pct)?` · ${marketSigned(pct,2)}%`:''}</span></div></div>`);
    }
    list.innerHTML=rows.join('')||'<div class="empty-mini">目前沒有持股。</div>';
    const when=snapshot.latestTradeDate||[...(snapshot.items||[])].map(x=>x.date).filter(Boolean).sort().at(-1)||'';
    status.textContent=`最新交易日 ${when||'--'}${snapshot.generatedAt?` · 行情檔已同步`:''}`;
  }catch(e){console.warn('market overview',e);status.textContent='暫時無法讀取每日行情檔，以下顯示本機最近資料。';indices.innerHTML=marketIndexCardHtml(null)+marketIndexCardHtml(null);list.innerHTML='<div class="empty-mini">行情檔讀取失敗。</div>';}
}
async function openInvestmentMarketOverview(){
  show($('investmentMarketOverviewScreen'));
  await fetchIntradayQuotes();
  await renderInvestmentMarketOverview({force:true});
}
async function fetchIntradayQuotes(){
  const pf=investmentPortfolio(dateKey(new Date())),symbols=[...new Set(pf.active.map(p=>p.symbol))];
  if(!symbols.length){toast('目前沒有持股');return;}
  const today=dateKey(new Date()),items=[];
  for(const symbol of symbols)items.push({symbol,meta:await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol)||{market:'TWSE'})});

  // 硬規則：同一標的今天正式收盤已存在本機，就完全不再抓任何市場資料。
  const finalCached=items.filter(x=>!!investmentCloseQuoteOn(x.symbol,today));
  const missing=items.filter(x=>!investmentCloseQuoteOn(x.symbol,today));
  if(!missing.length){
    if($('investmentIntradayBasis'))$('investmentIntradayBasis').textContent=`${today} 收盤價已快取 · 不重複讀取`;
    toast('今日收盤價已更新，不重複讀取',2400);
    return;
  }

  toast(finalCached.length?`正在讀取其餘 ${missing.length} 檔收盤價…`:'正在讀取最新收盤價…',1200);
  const checks=investmentManualQuoteChecks();
  let changed=false,snapshot=null,quotes=new Map();
  try{
    const result=await fetchStaticLatestSnapshot(missing,{force:true});
    snapshot=result.snapshot;quotes=result.quotes;
  }catch(e){
    console.warn('GitHub Pages market snapshot unavailable',e);
  }

  for(const {symbol,meta} of missing){
    const q=quotes.get(symbol);
    if(q){
      upsertInvestmentQuote({...q,name:meta?.name||q.name||'',fetchedAt:new Date().toISOString()});
      changed=true;
      checks[symbol]={checkedOn:today,closeDate:q.date,final:q.date===today,source:'static-json',updatedAt:new Date().toISOString()};
    }else{
      checks[symbol]={checkedOn:today,closeDate:'',final:false,source:'static-json-missing',updatedAt:new Date().toISOString()};
    }
  }

  await persistState();renderInvestment();

  const finalNow=items.filter(x=>!!investmentCloseQuoteOn(x.symbol,today)).length;
  const quoteDates=[...quotes.values()].map(q=>q.date).filter(Boolean).sort();
  const latestDate=quoteDates.at(-1)||'';
  const generatedAt=snapshot?.generatedAt?String(snapshot.generatedAt):'';

  if($('investmentIntradayBasis')){
    $('investmentIntradayBasis').textContent=finalNow===items.length
      ?`${today} 收盤價 ${finalNow}/${items.length} 檔已快取`
      :latestDate
        ?`每日行情檔最新交易日 ${latestDate}${generatedAt?` · 已同步`:''}`
        :'每日行情檔尚未產生 · 沿用本機收盤價';
  }
  if(finalNow===items.length)toast(`今日收盤價已更新 ${finalNow}/${items.length} 檔`,2400);
  else if(changed)toast(`已讀取 ${latestDate||'最近交易日'} 收盤價；今日收盤產生後再更新`,2800);
  else toast('每日行情檔尚未更新，已保留本機資料',2800);
}

function investmentSortedLedger(asOf='9999-12-31'){
  return investmentLedger.filter(t=>!t.voided&&t.date<=asOf).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
}
function investmentLatestQuote(symbol,asOf=dateKey(new Date()),priceType='close'){
  const key=investmentAssetKey(symbol);
  return investmentQuotes.filter(q=>q.symbol===key&&q.date<=asOf&&(q.priceType||'close')===priceType).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')))[0]||null;
}
function investmentLatestIntraday(symbol){return investmentLatestQuote(symbol,dateKey(new Date()),'intraday');}
function investmentFallbackPrice(symbol,asOf=dateKey(new Date())){
  const q=investmentLatestQuote(symbol,asOf); if(q)return {price:Number(q.price)||0,date:q.date,source:'quote'};
  const t=investmentSortedLedger(asOf).filter(x=>x.symbol===investmentAssetKey(symbol)&&['initial','buy','sell'].includes(x.kind)&&Number(x.price)>0).pop();
  return t?{price:Number(t.price)||0,date:t.date,source:'trade'}:{price:0,date:'',source:'none'};
}
function investmentFifoState(asOf=dateKey(new Date())){
  const map=new Map(),realizations=[];
  let unresolvedContributions=0;
  const ensurePosition=t=>{
    const key=investmentAssetKey(t.symbol);
    if(!map.has(key))map.set(key,{symbol:key,name:t.name||key,shortName:t.shortName||shortenSecurityName(t.name||key,key),securityType:t.securityType||guessSecurityType(key,t.name),lots:[],dividends:0,totalBuyCost:0,realized:0,realizedIncomplete:false,lastTradeDate:'',lastTradePrice:0,issues:[]});
    const p=map.get(key);if(t.name)p.name=t.name;if(t.shortName)p.shortName=t.shortName;if(t.securityType)p.securityType=t.securityType;return p;
  };
  for(const t of investmentSortedLedger(asOf)){
    if(t.kind==='contribution'){unresolvedContributions+=investmentTxnCash(t);continue;}
    if(!t.symbol)continue;
    const p=ensurePosition(t),q=Math.max(0,Number(t.quantity)||0);
    if(t.kind==='initial'||t.kind==='buy'){
      const pending=Boolean(t.costPending);
      const lotCost=pending?null:(t.kind==='buy'?investmentTxnCash(t):ntd(q*Math.max(0,Number(t.price)||0)));
      p.lots.push({id:t.id,date:t.date,kind:t.kind,quantity:q,remainingQuantity:q,cost:lotCost,remainingCost:lotCost,price:Number(t.price)||0,fee:Number(t.fee)||0,costPending:pending});
      if(lotCost!=null)p.totalBuyCost+=lotCost;
      p.lastTradeDate=t.date;if(Number(t.price)>0)p.lastTradePrice=Number(t.price)||0;
      continue;
    }
    if(t.kind==='sell'){
      const available=p.lots.reduce((sum,l)=>sum+Math.max(0,Number(l.remainingQuantity)||0),0);
      if(q>available+1e-8){p.issues.push({type:'oversell',id:t.id,date:t.date,requested:q,available});continue;}
      const gross=ntd(q*Math.max(0,Number(t.price)||0)),fee=ntd(Math.max(0,Number(t.fee)||0)),tax=ntd(Math.max(0,Number(t.tax)||0)),proceeds=ntd(gross-fee-tax);
      let remaining=q,costBasis=0,incomplete=false;const matches=[];
      for(const lot of p.lots){
        if(remaining<=1e-8)break;
        const availableLot=Math.max(0,Number(lot.remainingQuantity)||0);if(availableLot<=1e-8)continue;
        const take=Math.min(remaining,availableLot);
        let allocatedCost=null;
        if(lot.costPending||lot.remainingCost==null){incomplete=true;}
        else{
          allocatedCost=Math.abs(take-availableLot)<1e-8?ntd(lot.remainingCost):ntd(Number(lot.remainingCost)*(take/availableLot));
          lot.remainingCost=Math.max(0,ntd(Number(lot.remainingCost)-allocatedCost));costBasis+=allocatedCost;
        }
        lot.remainingQuantity=Math.max(0,availableLot-take);remaining-=take;
        matches.push({lotId:lot.id,date:lot.date,kind:lot.kind,quantity:take,unitCost:allocatedCost==null?null:(take>0?allocatedCost/take:0),costBasis:allocatedCost,sourcePrice:lot.price,costPending:allocatedCost==null});
      }
      const realized=incomplete?null:ntd(proceeds-costBasis);
      if(realized==null)p.realizedIncomplete=true;else p.realized+=realized;
      realizations.push({id:`realized-${t.id}`,sellId:t.id,symbol:p.symbol,name:p.name,shortName:p.shortName,securityType:p.securityType,date:t.date,quantity:q,sellPrice:Number(t.price)||0,gross,fee,tax,proceeds,costBasis:incomplete?null:ntd(costBasis),realized,returnRate:(!incomplete&&costBasis>0)?realized/costBasis:null,incomplete,matches});
      p.lastTradeDate=t.date;p.lastTradePrice=Number(t.price)||0;
      continue;
    }
    if(t.kind==='dividend')p.dividends+=ntd(Math.max(0,Number(t.amount)||0));
  }
  const positions=[...map.values()].map(p=>{
    const quantity=p.lots.reduce((sum,l)=>sum+Math.max(0,Number(l.remainingQuantity)||0),0);
    const remainingPending=p.lots.some(l=>Number(l.remainingQuantity)>1e-8&&(l.costPending||l.remainingCost==null));
    const cost=remainingPending?null:ntd(p.lots.reduce((sum,l)=>sum+(Number(l.remainingCost)||0),0));
    const qp=investmentFallbackPrice(p.symbol,asOf),currentPrice=qp.price||p.lastTradePrice||0,marketValue=ntd(quantity*currentPrice);
    const costIncomplete=Boolean(remainingPending||p.realizedIncomplete);
    const unrealized=remainingPending?null:ntd(marketValue-(cost||0));
    const totalProfit=(unrealized==null||p.realizedIncomplete)?null:ntd(p.realized+p.dividends+unrealized);
    return {symbol:p.symbol,name:p.name,shortName:p.shortName,securityType:p.securityType,quantity,cost,costIncomplete,realized:p.realized,realizedIncomplete:p.realizedIncomplete,dividends:p.dividends,totalBuyCost:p.totalBuyCost,lastTradeDate:p.lastTradeDate,lastTradePrice:p.lastTradePrice,currentPrice,quoteDate:qp.date,priceSource:qp.source,marketValue,unrealized,totalProfit,roi:(totalProfit!=null&&p.totalBuyCost>0)?totalProfit/p.totalBuyCost:null,avgCost:(cost!=null&&quantity>0)?cost/quantity:null,issues:p.issues||[]};
  });
  return {positions,realizations,unresolvedContributions};
}
function investmentRealizedTransactions({year=null,symbol='',asOf=dateKey(new Date())}={}){
  const key=investmentAssetKey(symbol),state=investmentFifoState(asOf);
  return state.realizations.filter(r=>(year==null||Number(String(r.date).slice(0,4))===Number(year))&&(!key||r.symbol===key)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.sellId).localeCompare(String(a.sellId)));
}
function investmentPortfolio(asOf=dateKey(new Date())){
  const state=investmentFifoState(asOf),positions=state.positions,active=positions.filter(p=>p.quantity>0.0000001);
  const incompletePerformance=positions.some(p=>p.costIncomplete);
  const complete=positions.filter(p=>!p.costIncomplete);
  const totals=complete.reduce((a,p)=>({cost:a.cost+(p.cost||0),marketValue:a.marketValue+p.marketValue,realized:a.realized+p.realized,dividends:a.dividends+p.dividends,totalBuyCost:a.totalBuyCost+p.totalBuyCost,unrealized:a.unrealized+(p.unrealized||0),totalProfit:a.totalProfit+(p.totalProfit||0)}),{cost:0,marketValue:0,realized:0,dividends:0,totalBuyCost:0,unrealized:0,totalProfit:0});
  totals.marketValue=positions.reduce((sum,p)=>sum+p.marketValue,0);
  totals.dividends=positions.reduce((sum,p)=>sum+p.dividends,0);
  totals.unresolvedContributions=state.unresolvedContributions;
  totals.costIncomplete=incompletePerformance;
  totals.roi=incompletePerformance?null:(totals.totalBuyCost>0?totals.totalProfit/totals.totalBuyCost:null);
  if(incompletePerformance){totals.cost=null;totals.realized=null;totals.unrealized=null;totals.totalProfit=null;}
  const issues=investmentHealthIssues();
  return {positions,active,totals,issues,realizations:state.realizations};
}
function investmentValueAsOf(d){return investmentPortfolio(d).active.reduce((s,p)=>s+p.marketValue,0);}
function investmentXirr(flows){
  const clean=flows.filter(f=>Number(f.amount)!==0&&f.date).map(f=>({...f,amount:Number(f.amount)})).sort((a,b)=>a.date.localeCompare(b.date));
  if(clean.length<2||!clean.some(f=>f.amount<0)||!clean.some(f=>f.amount>0))return null;
  const t0=parseDateKey(clean[0].date).getTime();
  const npv=r=>clean.reduce((sum,f)=>sum+f.amount/Math.pow(1+r,(parseDateKey(f.date).getTime()-t0)/86400000/365),0);
  let lo=-0.999999,hi=1,flo=npv(lo),fhi=npv(hi),expand=0;
  while(Number.isFinite(flo)&&Number.isFinite(fhi)&&flo*fhi>0&&expand<24){hi*=2;fhi=npv(hi);expand++;}
  if(!Number.isFinite(flo)||!Number.isFinite(fhi)||flo*fhi>0)return null;
  for(let i=0;i<160;i++){
    const mid=(lo+hi)/2,fm=npv(mid);
    if(!Number.isFinite(fm))return null;
    if(Math.abs(fm)<1e-8)return mid;
    if(flo*fm<=0){hi=mid;fhi=fm;}else{lo=mid;flo=fm;}
  }
  return (lo+hi)/2;
}
function investmentStrictCloseQuote(symbol,asOf,maxAgeDays=10){
  const q=investmentLatestQuote(symbol,asOf,'close');if(!q)return null;
  const age=(parseDateKey(asOf).getTime()-parseDateKey(q.date).getTime())/86400000;
  return Number.isFinite(age)&&age>=0&&age<=maxAgeDays?q:null;
}
function investmentOpeningPositions(year){
  const start=`${year}-01-01`,map=new Map();
  for(const t of ledgerSort(investmentLedger.filter(x=>!x.voided))){
    if(t.kind==='contribution'||t.kind==='dividend'||!t.symbol)continue;
    const isOpeningInitial=t.date===start&&t.kind==='initial';
    if(t.date>start||(t.date===start&&!isOpeningInitial))continue;
    const key=investmentAssetKey(t.symbol),q=Math.max(0,Number(t.quantity)||0),prev=map.get(key)||{symbol:key,name:t.name||key,shortName:t.shortName||shortenSecurityName(t.name||key,key),securityType:t.securityType||guessSecurityType(key,t.name),quantity:0};
    if(t.name)prev.name=t.name;if(t.shortName)prev.shortName=t.shortName;if(t.securityType)prev.securityType=t.securityType;
    if(t.kind==='initial'||t.kind==='buy')prev.quantity+=q;
    else if(t.kind==='sell')prev.quantity=Math.max(0,prev.quantity-q);
    map.set(key,prev);
  }
  return [...map.values()].filter(x=>x.quantity>1e-8);
}
function investmentQuantityPositionsAsOf(asOf){
  const map=new Map();
  for(const t of investmentSortedLedger(asOf)){
    if(t.kind==='contribution'||t.kind==='dividend'||!t.symbol)continue;
    const key=investmentAssetKey(t.symbol),q=Math.max(0,Number(t.quantity)||0),prev=map.get(key)||{symbol:key,name:t.name||key,shortName:t.shortName||shortenSecurityName(t.name||key,key),securityType:t.securityType||guessSecurityType(key,t.name),quantity:0};
    if(t.name)prev.name=t.name;if(t.shortName)prev.shortName=t.shortName;if(t.securityType)prev.securityType=t.securityType;
    if(t.kind==='initial'||t.kind==='buy')prev.quantity+=q;
    else if(t.kind==='sell')prev.quantity=Math.max(0,prev.quantity-q);
    map.set(key,prev);
  }
  return [...map.values()].filter(x=>x.quantity>1e-8);
}
function investmentValuationSnapshot(positions,asOf,{allowFallback=false}={}){
  let value=0;const missing=[],details=[],fallback=[];
  for(const p of positions){
    let q=investmentStrictCloseQuote(p.symbol,asOf),source='close';
    if(!q&&allowFallback){const f=investmentFallbackPrice(p.symbol,asOf);if(f?.price>0){q={price:f.price,date:f.date};source=f.source||'fallback';fallback.push(p.symbol);}}
    if(!q||!(Number(q.price)>0)){missing.push(p.symbol);details.push({...p,price:null,priceDate:'',marketValue:null});continue;}
    const mv=ntd(Number(p.quantity||0)*Number(q.price));value+=mv;details.push({...p,price:Number(q.price),priceDate:q.date,marketValue:mv,source});
  }
  return {value:ntd(value),missing,details,fallback,ready:missing.length===0};
}
function investmentYearOpeningSnapshot(year){
  const asOf=`${Number(year)-1}-12-31`,positions=investmentOpeningPositions(Number(year));
  return {...investmentValuationSnapshot(positions,asOf),date:asOf,positions};
}
function investmentYearClosingSnapshot(year){
  const today=dateKey(new Date()),yearEnd=`${year}-12-31`,asOf=yearEnd<today?yearEnd:today,positions=investmentQuantityPositionsAsOf(asOf),allowFallback=Number(year)===new Date().getFullYear();
  return {...investmentValuationSnapshot(positions,asOf,{allowFallback}),date:asOf,positions};
}
function investmentYearReturn(year){
  const y=Number(year),today=dateKey(new Date()),start=`${y}-01-01`,yearEnd=`${y}-12-31`,end=yearEnd<today?yearEnd:today;
  if(start>end)return null;
  const openingSnapshot=investmentYearOpeningSnapshot(y),closingSnapshot=investmentYearClosingSnapshot(y),flows=[];
  if(openingSnapshot.value>0)flows.push({date:start,amount:-openingSnapshot.value,type:'opening',label:'期初持股市值'});
  const rows=investmentSortedLedger(end).filter(t=>t.date>=start&&t.date<=end);
  let buys=0,sells=0,dividends=0,unresolved=0;
  for(const t of rows){
    const c=investmentTxnCash(t),display=investmentDisplayLabel(t.symbol,t.name,t.shortName);
    if(t.kind==='initial')continue; // initial 代表追蹤開始前已持有資產，不是本年度新增現金投入。
    if(t.kind==='buy'){
      if(!t.costPending&&Number(t.price)>=0)flows.push({date:t.date,amount:-c,type:'buy',symbol:t.symbol,label:`${display||t.symbol} 買進`});
      buys+=c;
    }else if(t.kind==='contribution'){buys+=c;unresolved+=c;}
    else if(t.kind==='sell'){flows.push({date:t.date,amount:c,type:'sell',symbol:t.symbol,label:`${display||t.symbol} 賣出`});sells+=c;}
    else if(t.kind==='dividend'){flows.push({date:t.date,amount:c,type:'dividend',symbol:t.symbol,label:`${display||t.symbol} 股息`});dividends+=c;}
  }
  if(closingSnapshot.value>0)flows.push({date:end,amount:closingSnapshot.value,type:'closing',label:'期末／目前持股市值'});
  const hasCostPending=rows.some(t=>t.kind==='buy'&&t.costPending),hasContribution=rows.some(t=>t.kind==='contribution'),missingBoundary=[...new Set([...openingSnapshot.missing,...closingSnapshot.missing])];
  const hasAnyUnresolved=hasContribution||hasCostPending||missingBoundary.length>0;
  const rate=hasAnyUnresolved?null:investmentXirr(flows);
  return {year:y,start,end,opening:openingSnapshot.value,closing:closingSnapshot.value,buys,sells,dividends,unresolved,rate,flows,openingSnapshot,closingSnapshot,missingBoundary,hasUnresolved:hasAnyUnresolved,hasCostPending,hasContribution,hasData:rows.length>0||openingSnapshot.positions.length>0||closingSnapshot.positions.length>0};
}
function investmentYearAssetGrowth(year){
  const r=investmentYearReturn(year);if(!r)return null;
  const assetChange=ntd(r.closing-r.opening),assetGrowthRate=r.opening>0?assetChange/r.opening:null;
  const investmentGain=ntd(r.closing+r.sells+r.dividends-r.buys-r.opening);
  return {...r,assetChange,assetGrowthRate,investmentGain};
}
function investmentSecurityCumulativePerformance(symbol,asOf=dateKey(new Date())){
  const key=investmentAssetKey(symbol),rows=investmentSortedLedger(asOf).filter(t=>t.symbol===key),p=investmentPortfolio(asOf).positions.find(x=>x.symbol===key);
  let invested=0,sales=0,dividends=0;const initialRows=[];
  for(const t of rows){
    if(t.kind==='initial'){invested+=investmentTxnCash(t);initialRows.push(t);}
    else if(t.kind==='buy')invested+=investmentTxnCash(t);
    else if(t.kind==='sell')sales+=investmentTxnCash(t);
    else if(t.kind==='dividend')dividends+=investmentTxnCash(t);
  }
  const marketValue=ntd(p?.marketValue||0),priceProfit=ntd(marketValue+sales-invested),totalProfit=ntd(priceProfit+dividends),priceReturn=invested>0?priceProfit/invested:null,totalReturn=invested>0?totalProfit/invested:null;
  const flows=[];let xirrIncomplete=false,trackingStart='';
  if(initialRows.length){
    trackingStart=initialRows.map(t=>t.date).sort()[0];
    const prior=addDaysKey(trackingStart,-1),openingQty=initialRows.filter(t=>t.date===trackingStart).reduce((sum,t)=>sum+Math.max(0,Number(t.quantity)||0),0),q=investmentStrictCloseQuote(key,prior);
    if(openingQty>0&&q?.price>0)flows.push({date:trackingStart,amount:-ntd(openingQty*Number(q.price)),type:'opening',label:'追蹤起始持股市值'});else xirrIncomplete=true;
  }
  for(const t of rows){
    if(t.kind==='initial'){
      if(trackingStart&&t.date!==trackingStart)xirrIncomplete=true;
      continue;
    }
    const c=investmentTxnCash(t);
    if(t.kind==='buy')flows.push({date:t.date,amount:-c,type:'buy',label:`${key} 買進`});
    else if(t.kind==='sell')flows.push({date:t.date,amount:c,type:'sell',label:`${key} 賣出`});
    else if(t.kind==='dividend')flows.push({date:t.date,amount:c,type:'dividend',label:`${key} 股息`});
    else if(t.kind==='contribution')xirrIncomplete=true;
  }
  if(!trackingStart){const first=rows.find(t=>['buy','sell','dividend'].includes(t.kind));trackingStart=first?.date||'';}
  if(marketValue>0)flows.push({date:asOf,amount:marketValue,type:'closing',label:'目前市值'});
  const xirr=(xirrIncomplete||rows.some(t=>t.costPending))?null:investmentXirr(flows);
  return {symbol:key,invested:ntd(invested),sales:ntd(sales),dividends:ntd(dividends),marketValue,priceProfit,totalProfit,priceReturn,totalReturn,xirr,flows,xirrIncomplete,trackingStart};
}
function parseTpexHistoricalRows(data){
  const tables=Array.isArray(data?.tables)?data.tables:[],table=tables[0]||{},fields=(table.fields||table.columns||[]).map(x=>typeof x==='string'?x:(x?.name||x?.title||'')),rows=Array.isArray(table.data)?table.data:(Array.isArray(data?.aaData)?data.aaData:Array.isArray(data?.data)?data.data:[]);
  return rows.map(r=>{
    if(!Array.isArray(r))return {symbol:investmentAssetKey(r.SecuritiesCompanyCode||r.Code||r['證券代號']||r['代號']),price:Number(String(r.Close||r['收盤']||r['收盤價']||'').replace(/,/g,''))};
    const si=fields.findIndex(x=>String(x).includes('代號')),pi=fields.findIndex(x=>String(x).includes('收盤'));
    return {symbol:investmentAssetKey(r[si>=0?si:0]),price:Number(String(r[pi>=0?pi:2]||'').replace(/,/g,''))};
  }).filter(x=>x.symbol&&x.price>0);
}
async function fetchHistoricalCloseAtOrBefore(meta,symbol,targetDate){
  const key=investmentAssetKey(symbol),market=meta?.market||cachedSecurityMeta(key)?.market||'TWSE',target=parseDateKey(targetDate);
  if(market==='TPEx'){
    for(let i=0;i<10;i++){
      const d=new Date(target);d.setDate(d.getDate()-i);const dk=dateKey(d),url=`https://www.tpex.org.tw/www/zh-tw/afterTrading/dailyQuotes?response=json&date=${encodeURIComponent(dk.replaceAll('-','/'))}`;
      try{const data=await fetchJsonWithTimeout(url,8000),row=parseTpexHistoricalRows(data).find(x=>x.symbol===key);if(row)return {symbol:key,name:meta?.name||'',price:row.price,date:dk,priceType:'close',source:'TPEx historical'};}catch(e){console.warn('TPEx historical close',key,dk,e);}
    }
    throw new Error('TPEx historical close unavailable');
  }
  const fetchMonth=async d=>{
    const monthKey=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}01`,url=`https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${monthKey}&stockNo=${encodeURIComponent(key)}&response=json`,data=await fetchJsonWithTimeout(url,8000),rows=Array.isArray(data?.data)?data.data:[];
    return rows.map(r=>({date:twseRowDateToIso(r[0]),price:Number(String(r[6]||'').replace(/,/g,''))})).filter(r=>r.date&&r.price>0&&r.date<=targetDate).sort((a,b)=>b.date.localeCompare(a.date));
  };
  let rows=await fetchMonth(target);if(!rows.length){const prev=new Date(target);prev.setDate(1);prev.setMonth(prev.getMonth()-1);rows=await fetchMonth(prev);}if(!rows.length)throw new Error('TWSE historical close unavailable');
  return {symbol:key,name:meta?.name||'',price:rows[0].price,date:rows[0].date,priceType:'close',source:'TWSE historical'};
}
async function ensureYearBoundaryPrices(year,{force=false}={}){
  const y=Number(year),key=`${y}`,pending=investmentBoundaryFetchInFlight.get(key);if(pending)return pending;
  if(force)investmentBoundaryFetchAttempted.delete(key);if(investmentBoundaryFetchAttempted.has(key))return false;
  const task=(async()=>{
    investmentBoundaryFetchAttempted.add(key);let changed=false;
    try{
      const boundaries=[];
      const opening=investmentYearOpeningSnapshot(y);if(opening.positions.length)boundaries.push({date:`${y-1}-12-31`,positions:opening.positions});
      const today=dateKey(new Date()),yearEnd=`${y}-12-31`;if(yearEnd<today){const closing=investmentQuantityPositionsAsOf(yearEnd);if(closing.length)boundaries.push({date:yearEnd,positions:closing});}
      for(const b of boundaries){
        for(const p of b.positions){
          if(investmentStrictCloseQuote(p.symbol,b.date))continue;
          try{const meta=await resolveSecurityMeta(p.symbol).catch(()=>cachedSecurityMeta(p.symbol)||{}),q=await fetchHistoricalCloseAtOrBefore(meta,p.symbol,b.date);upsertInvestmentQuote(q);changed=true;}catch(e){console.warn('boundary quote',y,p.symbol,b.date,e);}
        }
      }
      if(changed)await persistState();return changed;
    }finally{investmentBoundaryFetchInFlight.delete(key);}
  })();investmentBoundaryFetchInFlight.set(key,task);return task;
}
function renderInvestment(){
  if(!$('investmentScreen'))return;
  const now=dateKey(new Date()),currentYear=new Date().getFullYear(),pf=investmentPortfolio(now),t=pf.totals,yearReturn=investmentYearReturn(currentYear),assetGrowth=investmentYearAssetGrowth(currentYear),yearIncome=investmentYearlyIncomeBreakdown(currentYear),yearRealized=investmentRealizedForYear(currentYear),yearInvest=investmentYearInvestStats(currentYear);
  $('invMarketValue').textContent=investmentPrivateMoney(t.marketValue);
  $('invCost').textContent=t.costIncomplete?'待補成本':investmentPrivateMoney(t.cost);
  $('invTotalReturn').textContent=yearReturn?.missingBoundary?.length?'待補年末價':yearReturn?.hasUnresolved?'待補資料':investmentPrivatePct(yearReturn?.rate);
  $('invTotalProfit').textContent=yearReturn?.missingBoundary?.length?'XIRR · 正在補齊期初收盤價':'XIRR · 點一下看完整現金流';
  $('invDividendTotal').textContent=investmentPrivateMoney(yearIncome.total);
  $('invRealizedTotal').textContent=yearRealized==null?'待補成本':investmentPrivateMoney(yearRealized);
  $('invUnrealizedTotal').textContent=t.costIncomplete?'待補成本':investmentPrivateMoney(t.unrealized);
  if($('toggleInvestmentVisibilityBtn')){
    $('toggleInvestmentVisibilityBtn').innerHTML=investmentVisibilitySvg(investmentValuesVisible);
    $('toggleInvestmentVisibilityBtn').setAttribute('aria-label',investmentValuesVisible?'隱藏投資金額':'顯示投資金額');
    $('toggleInvestmentVisibilityBtn').setAttribute('aria-pressed',investmentValuesVisible?'true':'false');
  }
  setInvestmentGainTone($('invTotalReturn'),yearReturn?.rate);
  setInvestmentGainTone($('invUnrealizedTotal'),t.costIncomplete?null:t.unrealized);
  setInvestmentGainTone($('invRealizedTotal'),yearRealized);
  const quoteDates=pf.active.map(p=>p.quoteDate).filter(Boolean).sort();
  if($('investmentQuoteBasis')){
    if(!quoteDates.length)$('investmentQuoteBasis').textContent='尚無收盤價，暫以最近交易價估算';
    else if(new Set(quoteDates).size===1)$('investmentQuoteBasis').textContent=`依 ${quoteDates[0]} 收盤價估算`;
    else $('investmentQuoteBasis').textContent=`依各標的最近收盤價估算 · 最舊 ${quoteDates[0]}`;
  }
  const todayCloseCount=pf.active.filter(p=>!!investmentCloseQuoteOn(p.symbol,now)).length;
  if($('investmentIntradayValue')){
    $('investmentIntradayValue').textContent=todayCloseCount===pf.active.length&&pf.active.length?'今日收盤已更新':'更新股價';
    if($('investmentIntradayBasis'))$('investmentIntradayBasis').textContent=todayCloseCount===pf.active.length&&pf.active.length?`${now} 已快取 · 不重複讀取`:'讀取 GitHub Pages 每日收盤檔';
  }
  const issues=pf.issues||[];if($('investmentHealthNotice')){$('investmentHealthNotice').classList.toggle('hidden',issues.length===0);$('investmentHealthIssueCount').textContent=String(issues.length);if(issues.length){const x=issues[0];$('investmentHealthIssueText').textContent=`${x.date} ${x.symbol} 賣出 ${x.requested.toLocaleString('zh-TW')} 股，但當時可用持股僅 ${x.available.toLocaleString('zh-TW')} 股。此筆暫不納入持股計算，請修正歷史交易。`;}}

  const pendingRows=investmentLedger.filter(x=>x.kind==='contribution');
  const costPendingRows=investmentLedger.filter(x=>['initial','buy'].includes(x.kind)&&x.costPending);
  const pendingAmount=pendingRows.reduce((sum,x)=>sum+investmentTxnCash(x),0);
  $('investmentSyncNotice').classList.toggle('hidden',pendingRows.length===0&&costPendingRows.length===0);
  $('investmentSyncPendingCount').textContent=String(pendingRows.length+costPendingRows.length);
  $('investmentSyncPendingAmount').textContent=costPendingRows.length?`${investmentPrivateMoney(pendingAmount)} · ${costPendingRows.length} 筆成本待補`:investmentPrivateMoney(pendingAmount);

  // 年度投報率直接在首頁圖像化。
  const returnBox=$('investmentReturnChartHome'),returnEmpty=$('investmentReturnChartEmpty');
  if(returnBox){
    returnBox.innerHTML='';
    const years=[...new Set(investmentLedger.map(t=>Number(String(t.date||'').slice(0,4))).filter(Boolean))];if(!years.includes(currentYear))years.push(currentYear);
    const rows=years.sort((a,b)=>a-b).slice(-5).map(y=>({y,r:investmentYearReturn(y)})).filter(x=>x.r&&x.r.hasData);
    returnEmpty?.classList.toggle('hidden',rows.length>0);
    const maxRate=Math.max(.05,...rows.map(x=>Number.isFinite(x.r.rate)?Math.abs(x.r.rate):0));
    rows.forEach(({y,r})=>{
      const rate=r.rate,finite=Number.isFinite(rate),w=finite?Math.max(5,Math.min(100,Math.abs(rate)/maxRate*100)):0,el=document.createElement('button'),g=investmentYearAssetGrowth(y);
      el.type='button';el.className='investment-return-home-row investment-return-home-button';
      const growthText=g&&!g.missingBoundary?.length&&Number.isFinite(g.assetGrowthRate)?` · 資產成長 ${g.assetGrowthRate>=0?'+':''}${(g.assetGrowthRate*100).toFixed(1)}%`:'';
      const status=(r.missingBoundary?.length?'待補年末價':r.hasUnresolved?'資料待補':'XIRR')+growthText;
      el.innerHTML=`<div class="investment-return-home-label"><strong>${y}${y===currentYear?' YTD':''}</strong><span>${status}</span></div><div class="investment-return-home-track"><i class="${finite&&rate<0?'investment-loss-bg':'investment-gain-bg'}" style="width:${w.toFixed(1)}%"></i></div><b class="${finite?(rate>0?'investment-gain':rate<0?'investment-loss':''):''}">${r.missingBoundary?.length?'待補':r.hasUnresolved?'待補':investmentPrivatePct(rate)}</b><em>›</em>`;
      el.onclick=()=>openInvestmentReturnDetail(y);returnBox.appendChild(el);
    });
  }

  // 年度資產成長：刻意與投資報酬率分開。資產成長包含持續投入；投資創造增值則排除買進/賣出現金流並加回投資股息。
  if(assetGrowth){
    const missing=assetGrowth.missingBoundary||[],status=$('investmentAssetGrowthStatus'),openingReady=!missing.length;
    if(status){status.classList.toggle('hidden',openingReady);status.textContent=openingReady?'':`正在補齊 ${[...new Set(missing)].join('、')} 的前一年底收盤價；補齊前不顯示資產成長率與 XIRR。`;}
    $('investmentOpeningAssets').textContent=openingReady?investmentPrivateMoney(assetGrowth.opening):'待補年末價';
    $('investmentClosingAssets').textContent=investmentPrivateMoney(assetGrowth.closing);
    $('investmentAssetChange').textContent=openingReady?investmentPrivateMoney(assetGrowth.assetChange):'--';
    $('investmentAssetGrowthRate').textContent=openingReady&&Number.isFinite(assetGrowth.assetGrowthRate)?`${assetGrowth.assetGrowthRate>=0?'+':''}${(assetGrowth.assetGrowthRate*100).toFixed(1)}%`:'--';
    $('investmentAssetBuys').textContent=investmentPrivateMoney(assetGrowth.buys);
    $('investmentAssetSells').textContent=investmentPrivateMoney(assetGrowth.sells);
    $('investmentAssetDividends').textContent=investmentPrivateMoney(assetGrowth.dividends);
    $('investmentCreatedGain').textContent=openingReady?investmentPrivateMoney(assetGrowth.investmentGain):'--';
    setInvestmentGainTone($('investmentAssetChange'),openingReady?assetGrowth.assetChange:null);setInvestmentGainTone($('investmentCreatedGain'),openingReady?assetGrowth.investmentGain:null);setInvestmentGainTone($('investmentAssetGrowthRate'),openingReady?assetGrowth.assetGrowthRate:null);
    const maxAsset=Math.max(1,assetGrowth.opening,assetGrowth.closing),ow=openingReady?Math.max(3,assetGrowth.opening/maxAsset*100):0,cw=Math.max(3,assetGrowth.closing/maxAsset*100);
    $('investmentOpeningAssetsBar').style.width=`${ow.toFixed(1)}%`;$('investmentClosingAssetsBar').style.width=`${cw.toFixed(1)}%`;
  }
  if(yearReturn?.missingBoundary?.length)setTimeout(()=>ensureYearBoundaryPrices(currentYear).then(changed=>{if(changed)renderInvestment();}),0);

  // 持股分布：百分比固定小數 1 位，點整張卡進入持股總覽。
  const allocationLayout=$('investmentAllocationDonut').parentElement,allocationLegend=$('investmentAllocationLegend'),allocationEmpty=$('investmentAllocationEmpty'),allocationDonut=$('investmentAllocationDonut'),allocationTotal=pf.active.reduce((sum,p)=>sum+Math.max(0,p.marketValue),0);
  $('investmentPositionCount').textContent=pf.active.length.toLocaleString('zh-TW'); allocationLegend.innerHTML='';
  if(pf.active.length&&allocationTotal>0){
    allocationLayout.classList.remove('hidden');allocationEmpty.classList.add('hidden');
    const colors=['#7188c6','#8b78cb','#67a78d','#d7aa61','#d47d72','#65a3b5','#9c8bb8','#c29468','#75a0c8','#b98787'],sorted=pf.active.slice().sort((a,b)=>b.marketValue-a.marketValue),slices=sorted.map(p=>({symbol:p.symbol,name:investmentDisplayLabel(p.symbol,p.name,p.shortName),value:p.marketValue}));
    let acc=0;const stops=[];
    slices.forEach((item,i)=>{const from=acc/allocationTotal*100;acc+=item.value;const to=acc/allocationTotal*100,color=colors[i%colors.length],pct=allocationTotal?item.value/allocationTotal*100:0;stops.push(`${color} ${from.toFixed(2)}% ${to.toFixed(2)}%`);const row=document.createElement('div');row.className='investment-allocation-legend-item';row.innerHTML=`<i style="background:${color}"></i><span>${escapeHtml(item.name)}</span><strong>${pct.toFixed(1)}%</strong>`;allocationLegend.appendChild(row);});
    allocationDonut.style.background=`conic-gradient(${stops.join(',')})`;
  }else{allocationLayout.classList.add('hidden');allocationEmpty.classList.remove('hidden');allocationDonut.style.background='conic-gradient(#edf0f3 0 100%)';}

  if($('investmentYearInvestAmount'))$('investmentYearInvestAmount').textContent=investmentPrivateMoney(yearInvest.amount);
  if($('investmentYearInvestCount'))$('investmentYearInvestCount').textContent=String(yearInvest.count);
  if($('investmentYearInvestSymbols'))$('investmentYearInvestSymbols').textContent=String(yearInvest.symbols);

  renderInvestmentHoldingsOverview(pf);
  renderInvestmentIncomeAnalysis();
  renderInvestmentActivity();
  setTimeout(()=>ensureLatestClosePrices(),0);
  renderDividendCalendar();
}
function renderInvestmentHoldingsOverview(pf=investmentPortfolio(dateKey(new Date()))){
  const box=$('investmentHoldingsCards'),empty=$('investmentHoldingsCardsEmpty');if(!box)return;box.innerHTML='';const total=pf.active.reduce((sum,p)=>sum+Math.max(0,p.marketValue),0);
  $('investmentHoldingsCount').textContent=String(pf.active.length);$('investmentHoldingsMarketValue').textContent=investmentPrivateMoney(total);empty.classList.toggle('hidden',pf.active.length>0);
  pf.active.slice().sort((a,b)=>b.marketValue-a.marketValue).forEach(p=>{
    const pct=total?p.marketValue/total*100:0,row=document.createElement('button'),profit=p.costIncomplete?null:p.totalProfit;row.type='button';row.className='investment-holding-card-v147';
    row.innerHTML=`<div class="investment-holding-card-head"><div><strong>${escapeHtml(investmentDisplayLabel(p.symbol,p.name,p.shortName))}</strong><span class="investment-holding-card-shares">${p.quantity.toLocaleString('zh-TW',{maximumFractionDigits:4})} 股</span></div><b>${pct.toFixed(1)}%</b></div><div class="investment-holding-card-values"><div><span>市值</span><strong>${investmentPrivateMoney(p.marketValue)}</strong></div><div><span>總報酬</span><strong class="${profit==null?'':profit>0?'investment-gain':profit<0?'investment-loss':''}">${p.costIncomplete?'待補成本':`${investmentPrivateMoney(profit)} · ${investmentPrivatePct(p.roi)}`}</strong></div></div><div class="investment-holding-allocation-track"><i style="width:${Math.max(2,pct).toFixed(1)}%"></i></div><small>均價 ${p.costIncomplete?'待補':investmentPrice(p.avgCost)} · 現價 ${investmentPrice(p.currentPrice)}${p.quoteDate?` · ${escapeHtml(p.quoteDate)}`:''}</small>`;
    row.onclick=()=>openInvestmentSecurityDetail(p.symbol);box.appendChild(row);
  });
}
function renderInvestmentIncomeAnalysis(){
  const chart=$('investmentIncomeAnnualChart');if(!chart)return;
  const currentYear=new Date().getFullYear(),currentMonth=String(new Date().getMonth()+1).padStart(2,'0');
  if(!$('investmentIncomeStartMonth').value)$('investmentIncomeStartMonth').value=`${currentYear}-01`;
  if(!$('investmentIncomeEndMonth').value)$('investmentIncomeEndMonth').value=`${currentYear}-${currentMonth}`;
  renderInvestmentIncomeRange();
  chart.innerHTML='';const years=investmentIncomeYears(),rows=years.map(investmentYearlyIncomeBreakdown).filter(r=>r.total>0||r.year===currentYear),max=Math.max(1,...rows.map(r=>Math.max(r.dividend,r.spouse,r.total)));
  $('investmentIncomeAnnualEmpty').classList.toggle('hidden',rows.length>0);
  rows.forEach(r=>{const el=document.createElement('div');el.className='investment-income-year-row';el.innerHTML=`<div class="investment-income-year-title"><strong>${r.year}</strong><b>${investmentPrivateMoney(r.total)}</b></div><div class="investment-income-bar-line"><span>股息</span><div><i class="dividend" style="width:${Math.max(r.dividend?3:0,r.dividend/max*100).toFixed(1)}%"></i></div><b>${investmentPrivateMoney(r.dividend)}</b></div><div class="investment-income-bar-line"><span>分紅</span><div><i class="spouse" style="width:${Math.max(r.spouse?3:0,r.spouse/max*100).toFixed(1)}%"></i></div><b>${investmentPrivateMoney(r.spouse)}</b></div>`;chart.appendChild(el);});
  renderAnnualSummaries();
}
function renderInvestmentIncomeRange(){
  const s=$('investmentIncomeStartMonth'),e=$('investmentIncomeEndMonth');if(!s||!e)return;const start=monthStartKey(s.value),end=monthEndKey(e.value),r=investmentIncomeForRange(start,end);
  $('investmentPeriodDividend').textContent=investmentPrivateMoney(r.dividend);$('investmentPeriodSpouse').textContent=investmentPrivateMoney(r.spouse);$('investmentPeriodTotal').textContent=investmentPrivateMoney(r.total);
  const warn=$('investmentIncomeRangeWarning');warn.classList.toggle('hidden',!r.warnings.length);warn.textContent=r.warnings.join(' ');
}
function renderInvestmentActivity(){
  const select=$('investmentActivityYearInput');if(!select)return;const currentYear=new Date().getFullYear(),years=[...new Set(investmentLedger.map(t=>Number(String(t.date||'').slice(0,4))).filter(Boolean))].sort((a,b)=>b-a);if(!years.includes(currentYear))years.unshift(currentYear);
  const prev=Number(select.value)||currentYear;select.innerHTML=years.map(y=>`<option value="${y}">${y}${y===currentYear?'（今年）':''}</option>`).join('');select.value=String(years.includes(prev)?prev:currentYear);const year=Number(select.value),stats=investmentYearInvestStats(year);
  $('investmentActivityTotal').textContent=investmentPrivateMoney(stats.amount);$('investmentActivityCount').textContent=String(stats.count);$('investmentActivitySymbols').textContent=String(stats.symbols);
  const box=$('investmentActivityList'),empty=$('investmentActivityEmpty');box.innerHTML='';const rows=investmentLedger.filter(t=>!t.voided&&Number(String(t.date||'').slice(0,4))===year&&t.kind!=='initial').slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  empty.classList.toggle('hidden',rows.length>0);rows.forEach(t=>{const amt=investmentTxnCash(t),row=document.createElement('button'),flowClass=['buy','contribution'].includes(t.kind)?'out':'in',display=investmentDisplayLabel(t.symbol,t.name,t.shortName);row.type='button';row.className='investment-ledger-row investment-ledger-row-v147';row.innerHTML=`<div class="investment-ledger-icon kind-${escapeHtml(t.kind)}">${investmentKindIcon(t.kind)}</div><div class="investment-ledger-main"><strong>${escapeHtml(display||t.title||'未指定標的')} <span class="investment-kind-chip">${investmentKindLabel(t.kind)}</span></strong><span>${escapeHtml(t.date)}${['buy','sell'].includes(t.kind)?` · ${Number(t.quantity||0).toLocaleString('zh-TW')} 股 @ ${investmentPrice(t.price)}`:''}</span></div><div class="investment-ledger-amount ${flowClass}">${flowClass==='out'?'-':'+'}${investmentPrivateMoney(amt)}<em>›</em></div>`;row.onclick=()=>openInvestmentTxnEditor(t.id);box.appendChild(row);});
}
function investmentPendingRows(){
  return investmentLedger.filter(t=>!t.voided&&(t.kind==='contribution'||(['initial','buy'].includes(t.kind)&&t.costPending))).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.symbol||'').localeCompare(String(b.symbol||'')));
}
function openInvestmentPendingEditor(id){
  const t=investmentLedger.find(x=>x.id===id);if(!t)return;
  hide($('investmentPendingScreen'));openInvestmentTxnEditor(id);
  if(t.kind==='contribution'){
    $('investmentTxnEditorTitle').textContent='補成交資訊';
    $('investmentTxnKindInput').value='buy';
    syncInvestmentTxnFields();syncInvestmentCostManualState();
    requestAnimationFrame(()=>$('investmentQuantityInput')?.focus());
  }else if(t.costPending){
    $('investmentTxnEditorTitle').textContent='補成本資料';
    requestAnimationFrame(()=>$('investmentTxnPriceInput')?.focus());
  }
}
function renderInvestmentPendingList(){
  const box=$('investmentPendingList'),empty=$('investmentPendingEmpty');if(!box||!empty)return;
  const rows=investmentPendingRows();box.innerHTML='';empty.classList.toggle('hidden',rows.length>0);
  rows.forEach(t=>{
    const b=document.createElement('button');b.type='button';b.className='investment-pending-row';
    const label=investmentDisplayLabel(t.symbol,t.name,t.shortName)||t.title||'未指定標的';
    const isContribution=t.kind==='contribution',meta=isContribution?`${escapeHtml(t.date)} · 已記帳投入 ${investmentPrivateMoney(investmentTxnCash(t))}`:`${escapeHtml(t.date)} · ${Number(t.quantity||0).toLocaleString('zh-TW',{maximumFractionDigits:4})} 股`;
    b.innerHTML=`<span class="investment-pending-row-icon">${isContribution?'↗':'$'}</span><div class="investment-pending-row-main"><strong>${escapeHtml(label)}</strong><span>${meta}</span><small>${isContribution?'點一下補股數與成交價':'點一下補成本／成交價'}</small></div><em>›</em>`;
    b.onclick=()=>openInvestmentPendingEditor(t.id);box.appendChild(b);
  });
}
function openInvestmentPendingList(){
  const rows=investmentPendingRows();if(!rows.length){toast('目前沒有待補投資資料');return;}
  if(rows.length===1){openInvestmentPendingEditor(rows[0].id);return;}
  renderInvestmentPendingList();show($('investmentPendingScreen'));
}
function openInvestmentHoldingsOverview(){hide($('investmentScreen'));show($('investmentHoldingsScreen'));renderInvestmentHoldingsOverview();window.scrollTo({top:0,behavior:'auto'});}
function closeInvestmentHoldingsOverview(){hide($('investmentHoldingsScreen'));show($('investmentScreen'));window.scrollTo({top:0,behavior:'auto'});}
function openInvestmentIncomeAnalysis(){hide($('investmentScreen'));show($('investmentIncomeAnalysisScreen'));renderInvestmentIncomeAnalysis();window.scrollTo({top:0,behavior:'auto'});}
function closeInvestmentIncomeAnalysis(){hide($('investmentIncomeAnalysisScreen'));show($('investmentScreen'));window.scrollTo({top:0,behavior:'auto'});}
function openInvestmentActivity(){hide($('investmentScreen'));show($('investmentActivityScreen'));renderInvestmentActivity();window.scrollTo({top:0,behavior:'auto'});}
function closeInvestmentActivity(){hide($('investmentActivityScreen'));show($('investmentScreen'));window.scrollTo({top:0,behavior:'auto'});}
function syncInvestmentTxnFields(){
  const kind=$('investmentTxnKindInput').value,qtyPrice=['initial','buy','sell'].includes(kind); $('investmentQtyPriceFields').classList.toggle('hidden',!qtyPrice); $('investmentFeeTaxFields').classList.toggle('hidden',!['buy','sell'].includes(kind)); $('investmentDividendFields').classList.toggle('hidden',kind!=='dividend'); $('investmentContributionFields').classList.toggle('hidden',kind!=='contribution'); $('investmentTaxWrap').classList.toggle('hidden',kind!=='sell'); $('investmentTxnPriceLabel').textContent=kind==='initial'?'平均成本價':'成交價'; syncInvestmentAutoCosts();
}
function currentInvestmentEditorLedger(){return investmentEditingId?investmentLedger.find(x=>x.id===investmentEditingId):null;}
function currentInvestmentEditorMeta(){const symbol=investmentAssetKey($('investmentSymbolInput').value),name=$('investmentNameInput').value.trim();return cachedSecurityMeta(symbol)||normalizeSecurityMeta({name:name||symbol},symbol);}
function syncInvestmentCostManualState(){
  const manual=!!$('investmentCostManualInput')?.checked; if($('investmentFeeInput'))$('investmentFeeInput').readOnly=!manual;if($('investmentTaxInput'))$('investmentTaxInput').readOnly=!manual;syncInvestmentAutoCosts();
}
function syncInvestmentAutoCosts(){
  if(!$('investmentTxnKindInput'))return;const kind=$('investmentTxnKindInput').value,manual=!!$('investmentCostManualInput')?.checked;
  if(!['buy','sell'].includes(kind)){if($('investmentCostHint'))$('investmentCostHint').textContent='';return;}
  const old=currentInvestmentEditorLedger(),symbol=investmentAssetKey($('investmentSymbolInput').value),quantity=Number($('investmentQuantityInput').value||0),price=Number($('investmentTxnPriceInput').value||0),date=$('investmentTxnDateInput').value||dateKey(new Date()),meta=currentInvestmentEditorMeta(),recurring=ledgerIsRecurring(old);
  const costs=calcAutoInvestmentCosts({kind,quantity,price,symbol,name:meta?.name,securityType:meta?.securityType,date,recurring});
  if(!manual){$('investmentFeeInput').value=costs.fee||0;$('investmentTaxInput').value=costs.tax||0;}
  if($('investmentCostHint'))$('investmentCostHint').textContent=kind==='buy'
    ?`成交金額 ${money(costs.gross)} · ${recurring?'定期定額手續費 1 元':`一般手續費 2.8 折，最低 20 元`} · 自動手續費 ${money(costs.fee)}`
    :`成交金額 ${money(costs.gross)} · 手續費 ${money(costs.fee)} · 證交稅 ${money(costs.tax)}（依標的類型自動）`;
}
async function refreshInvestmentSymbolMeta(force=false){
  const symbol=investmentAssetKey($('investmentSymbolInput').value); if(!symbol){$('investmentSecurityMetaStatus').textContent='輸入代號後會自動帶入中文名稱與商品類型';return;}
  $('investmentSecurityMetaStatus').textContent='正在辨識標的…';
  try{const meta=await resolveSecurityMeta(symbol,{force});if(investmentAssetKey($('investmentSymbolInput').value)!==symbol)return;$('investmentNameInput').value=meta?.name||'';$('investmentSecurityMetaStatus').textContent=`${meta?.shortName||meta?.name||symbol} · ${meta?.securityType==='stock'?'股票':meta?.securityType==='bond-etf'?'債券 ETF':'ETF'}${meta?.market?` · ${meta.market}`:''}`;syncInvestmentAutoCosts();}
  catch(e){console.warn(e);$('investmentSecurityMetaStatus').textContent='目前無法連線查名稱，仍可先以代號儲存；之後會再自動補齊。';syncInvestmentAutoCosts();}
}
function scheduleInvestmentSymbolLookup(){clearTimeout(securityLookupTimer);securityLookupTimer=setTimeout(()=>refreshInvestmentSymbolMeta(false),350);}
async function refreshSimpleSecurityMeta(inputId,statusId){
  const input=$(inputId),status=$(statusId);if(!input||!status)return;const symbol=investmentAssetKey(input.value);
  if(!symbol){status.textContent='輸入代號後會自動顯示中文名稱。';return;}
  status.textContent='正在辨識標的…';
  try{const meta=await resolveSecurityMeta(symbol);if(investmentAssetKey(input.value)!==symbol)return;status.textContent=`${meta.name} · ${meta.securityType==='stock'?'股票':meta.securityType==='bond-etf'?'債券 ETF':'ETF'}`;}
  catch(e){console.warn(e);status.textContent='目前無法連線查名稱，仍可先以代號儲存。';}
}
function scheduleSimpleSecurityMeta(inputId,statusId){clearTimeout(securityLookupTimer);securityLookupTimer=setTimeout(()=>refreshSimpleSecurityMeta(inputId,statusId),350);}
function openInvestmentTxnEditor(id=null){
  investmentEditingId=id; const t=id?investmentLedger.find(x=>x.id===id):null; $('investmentTxnEditorTitle').textContent=t?'編輯投資紀錄':'新增投資紀錄'; $('investmentTxnKindInput').value=t?.kind||'buy'; $('investmentSymbolInput').value=t?.symbol||''; $('investmentNameInput').value=t?.name||''; $('investmentQuantityInput').value=t?.quantity||''; $('investmentTxnPriceInput').value=t?.price||''; $('investmentFeeInput').value=ntd(t?.fee||0); $('investmentTaxInput').value=ntd(t?.tax||0); $('investmentDividendAmountInput').value=t?.kind==='dividend'?(ntd(t?.amount)||''):''; $('investmentContributionAmountInput').value=t?.kind==='contribution'?(ntd(t?.amount)||''):''; $('investmentTxnDateInput').value=t?.date||selectedDate||dateKey(new Date()); $('investmentTxnNoteInput').value=t?.note||''; if($('investmentCostManualInput'))$('investmentCostManualInput').checked=t?.feeMode==='manual'||t?.taxMode==='manual'; syncInvestmentTxnFields(); syncInvestmentCostManualState(); $('deleteInvestmentTxnBtn').classList.toggle('hidden',!t); show($('investmentTxnEditorScreen')); if(t?.symbol)refreshInvestmentSymbolMeta(false);
}
function investmentHoldingBefore(symbol,date,excludeId=null){
  const old=investmentLedger; investmentLedger=old.filter(t=>t.id!==excludeId&&t.date<=date); const p=investmentPortfolio(date).positions.find(p=>p.symbol===symbol); investmentLedger=old; return p?.quantity||0;
}
function removeLinkedBookkeepingTxn(t){if(!t?.bookkeepingTxnId)return;txns=txns.filter(x=>x.id!==t.bookkeepingTxnId);}
function syncInvestmentBookkeeping(t,old=null){
  if(old&&old.bookkeepingTxnId&&old.bookkeepingTxnId!==t.bookkeepingTxnId)txns=txns.filter(x=>x.id!==old.bookkeepingTxnId);
  const needs=['buy','contribution','dividend'].includes(t.kind); if(!needs){removeLinkedBookkeepingTxn(old||t);t.bookkeepingTxnId=null;return;}
  const id=old?.bookkeepingTxnId||t.bookkeepingTxnId||uid(); t.bookkeepingTxnId=id; const existing=txns.find(x=>x.id===id); const base={id,date:t.date,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),source:'investment-ledger',investmentLedgerId:t.id};
  if(existing?.recurringId)base.recurringId=existing.recurringId;if(existing?.recurringKey)base.recurringKey=existing.recurringKey;if(existing?.sourceRecurringPending)base.sourceRecurringPending=existing.sourceRecurringPending;
  const label=t.symbol||t.title||t.name||'投資';
  const item=t.kind==='dividend'
    ?{...base,type:'income',title:`${label} 股息`,amount:ntd(investmentTxnCash(t)),incomeCategory:'股息',investmentSymbol:t.symbol||'',investmentName:t.name||'',note:t.note||''}
    :{...base,type:'investment',title:t.kind==='contribution'?(t.title||`${label} 投入`):`${label} 買進`,amount:ntd(investmentTxnCash(t)),investmentCategory:'股票／ETF',investmentSymbol:t.symbol||'',investmentName:t.name||'',note:t.note||''};
  if(existing)txns=txns.map(x=>x.id===id?item:x);else txns.push(item);
}
async function saveInvestmentTxn(){
  const kind=$('investmentTxnKindInput').value,symbol=investmentAssetKey($('investmentSymbolInput').value),date=$('investmentTxnDateInput').value,note=$('investmentTxnNoteInput').value.trim(); if(!date||(!symbol&&kind!=='contribution')){toast(kind==='contribution'?'請輸入日期':'請輸入股票代號與日期');return;}
  const old=investmentEditingId?investmentLedger.find(x=>x.id===investmentEditingId):null,meta=symbol?(await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol))):null;
  const name=meta?.name||$('investmentNameInput').value.trim(),shortName=meta?.shortName||shortenSecurityName(name,symbol),securityType=meta?.securityType||guessSecurityType(symbol,name),quantity=Number($('investmentQuantityInput').value||0),price=Number($('investmentTxnPriceInput').value||0),manualCosts=!!$('investmentCostManualInput')?.checked,recurring=ledgerIsRecurring(old);
  const auto=calcAutoInvestmentCosts({kind,quantity,price,symbol,name,securityType,date,recurring});
  const fee=['buy','sell'].includes(kind)?(manualCosts?ntd($('investmentFeeInput').value||0):auto.fee):0,tax=kind==='sell'?(manualCosts?ntd($('investmentTaxInput').value||0):auto.tax):0;
  const amount=kind==='dividend'?ntd($('investmentDividendAmountInput').value||0):kind==='contribution'?ntd($('investmentContributionAmountInput').value||0):0;
  const t={id:old?.id||uid(),kind,symbol,name,shortName,securityType,title:old?.title||'',date,note,quantity,price,fee,tax,amount,feeMode:manualCosts?'manual':'auto',taxMode:manualCosts?'manual':'auto',ownedBy:kind==='contribution'?'bookkeeping':(kind==='buy'?'investment':'shared'),status:kind==='contribution'?'pending':'complete',costPending:false,datePending:false,createdAt:old?.createdAt||new Date().toISOString(),bookkeepingTxnId:old?.bookkeepingTxnId||null,source:old?.source||'investment-ledger'};
  if(['initial','buy','sell'].includes(kind)&&(t.quantity<=0||t.price<=0)){toast('請輸入正確的股數與價格');return;} if(kind==='dividend'&&t.amount<=0){toast('請輸入實收股息');return;} if(kind==='contribution'&&t.amount<=0){toast('請輸入投入金額');return;}
  const beforeIssueKeys=new Set(validateInvestmentLedger(investmentLedger).map(x=>`${x.id}|${x.date}|${x.symbol}`));
  const candidate=old?investmentLedger.map(x=>x.id===old.id?t:x):investmentLedger.concat(t);const newIssues=validateInvestmentLedger(candidate).filter(x=>!beforeIssueKeys.has(`${x.id}|${x.date}|${x.symbol}`)||x.id===t.id);
  if(newIssues.length){const x=newIssues[0];toast(`${x.date} ${x.symbol} 賣出 ${x.requested.toLocaleString('zh-TW')} 股，但當時只有 ${x.available.toLocaleString('zh-TW')} 股。請先補齊或修正歷史交易。`,4200);return;}
  if(old)investmentLedger=investmentLedger.map(x=>x.id===old.id?t:x);else investmentLedger.push(t); syncInvestmentBookkeeping(t,old);
  const linkedDividendEvent=dividendEvents.find(e=>e.ledgerTxnId===t.id);
  if(kind==='dividend'){
    if(linkedDividendEvent){Object.assign(linkedDividendEvent,{symbol:t.symbol,name:t.name,shortName:t.shortName,securityType:t.securityType,expectedPayDate:linkedDividendEvent.expectedPayDate||t.date,actualPayDate:t.date,actualAmount:t.amount,note:t.note,bookkeepingTxnId:t.bookkeepingTxnId});}
    else dividendEvents.push({id:uid(),symbol:t.symbol,name:t.name,shortName:t.shortName,securityType:t.securityType,exDate:'',expectedPayDate:t.date,actualPayDate:t.date,perShare:0,actualAmount:t.amount,statusOverride:'',note:t.note,createdAt:t.createdAt,bookkeepingTxnId:t.bookkeepingTxnId,ledgerTxnId:t.id});
  }else if(linkedDividendEvent){dividendEvents=dividendEvents.filter(e=>e.id!==linkedDividendEvent.id);}
  await persistState(); hide($('investmentTxnEditorScreen'));renderAll();toast(kind==='dividend'?'股息已記錄並同步收入':kind==='contribution'?'投入金額已同步記帳':'投資紀錄已儲存並同步');
}
async function deleteInvestmentTxn(){
  const t=investmentLedger.find(x=>x.id===investmentEditingId);if(!t)return;const candidate=investmentLedger.filter(x=>x.id!==t.id),before=new Set(validateInvestmentLedger(investmentLedger).map(x=>`${x.id}|${x.date}|${x.symbol}`)),newIssues=validateInvestmentLedger(candidate).filter(x=>!before.has(`${x.id}|${x.date}|${x.symbol}`));
  if(newIssues.length){const x=newIssues[0];toast(`不能刪除：會讓 ${x.date} ${x.symbol} 出現超賣。請先調整後續交易。`,3600);return;}
  if(!confirm(`確定刪除「${t.symbol} ${investmentKindLabel(t.kind)}」？${t.bookkeepingTxnId?'\n\n連動的記帳紀錄也會一併刪除。':''}`))return;removeLinkedBookkeepingTxn(t);investmentLedger=candidate;dividendEvents=dividendEvents.filter(e=>e.ledgerTxnId!==t.id);await persistState();hide($('investmentTxnEditorScreen'));renderAll();toast('投資紀錄已刪除');
}
async function refreshInvestmentQuoteSymbolMeta(){const symbol=investmentAssetKey($('investmentQuoteSymbolInput').value);if(!symbol)return;const meta=await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol));if(meta&&investmentAssetKey($('investmentQuoteSymbolInput').value)===symbol)$('investmentQuoteNameInput').value=meta.name||'';}
function openInvestmentQuoteEditor(symbol='',name=''){
  investmentQuoteEditingId=null;const key=investmentAssetKey(symbol),meta=cachedSecurityMeta(key),q=investmentLatestQuote(key,dateKey(new Date()));$('investmentQuoteSymbolInput').value=key;$('investmentQuoteNameInput').value=name||meta?.name||q?.name||'';$('investmentQuotePriceInput').value=q?.price||'';$('investmentQuoteDateInput').value=dateKey(new Date());show($('investmentQuoteEditorScreen'));if(key)refreshInvestmentQuoteSymbolMeta();
}
async function saveInvestmentQuote(){
  const symbol=investmentAssetKey($('investmentQuoteSymbolInput').value),price=Number($('investmentQuotePriceInput').value||0),date=$('investmentQuoteDateInput').value;if(!symbol||price<=0||!date){toast('請輸入代號、價格與日期');return;}const meta=await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol)),name=meta?.name||$('investmentQuoteNameInput').value.trim(),shortName=meta?.shortName||shortenSecurityName(name,symbol),securityType=meta?.securityType||guessSecurityType(symbol,name); upsertInvestmentQuote({symbol,name,price,date,priceType:'close',source:'manual'}); if(name)investmentLedger=investmentLedger.map(t=>t.symbol===symbol?{...t,name,shortName,securityType}:t);await persistState();hide($('investmentQuoteEditorScreen'));renderInvestment();toast('收盤價已更新');
}


function openDividendEventEditor(id=null,symbol=''){
  dividendEventEditingId=id; const e=id?dividendEvents.find(x=>x.id===id):null,key=investmentAssetKey(e?.symbol||symbol),meta=cachedSecurityMeta(key);
  $('dividendEventEditorTitle').textContent=e?'編輯股息事件':'新增股息事件';
  $('dividendSymbolInput').value=key;$('dividendNameInput').value=e?.name||meta?.name||'';$('dividendExDateInput').value=e?.exDate||'';$('dividendExpectedPayDateInput').value=e?.expectedPayDate||'';$('dividendActualPayDateInput').value=e?.actualPayDate||'';$('dividendPerShareInput').value=e?.perShare||'';$('dividendActualAmountInput').value=e?.actualAmount??'';$('dividendNoteInput').value=e?.note||'';
  $('deleteDividendEventBtn').classList.toggle('hidden',!e); renderDividendEditorPreview(); show($('dividendEventEditorScreen')); if(key)refreshDividendSymbolMeta();
}
async function refreshDividendSymbolMeta(){
  const symbol=investmentAssetKey($('dividendSymbolInput').value); if(!symbol){$('dividendMetaStatus').textContent='輸入代號後會自動顯示名稱。';renderDividendEditorPreview();return;}
  $('dividendMetaStatus').textContent='正在辨識標的…';
  try{const meta=await resolveSecurityMeta(symbol);if(investmentAssetKey($('dividendSymbolInput').value)!==symbol)return;$('dividendNameInput').value=meta.name||'';$('dividendMetaStatus').textContent=`${meta.shortName||meta.name} · ${meta.securityType==='stock'?'股票':meta.securityType==='bond-etf'?'債券 ETF':'ETF'}`;}catch{$('dividendMetaStatus').textContent='暫時無法抓名稱，可先用代號儲存。';}
  renderDividendEditorPreview();
}
function renderDividendEditorPreview(){
  const symbol=investmentAssetKey($('dividendSymbolInput')?.value),exDate=$('dividendExDateInput')?.value,perShare=Number($('dividendPerShareInput')?.value||0);if(!$('dividendDerivedPreview'))return;
  if(!symbol||!exDate){$('dividendDerivedPreview').innerHTML='<span>填入代號與除息日後，會依除息前一交易日的持股現算應領股數。</span>';return;}
  const shares=investmentSharesAsOf(symbol,investmentPreviousDayKey(exDate)),estimated=perShare>0?ntd(shares*perShare):null;
  $('dividendDerivedPreview').innerHTML=`<span>除息前持股</span><strong>${shares.toLocaleString('zh-TW',{maximumFractionDigits:4})} 股</strong><span>預估股息</span><strong>${estimated==null?'--':money(estimated)}</strong>`;
}
function syncDividendEventLedger(e){
  const paid=!!e.actualPayDate&&e.actualAmount!=null&&Number(e.actualAmount)>=0;
  const existing=e.ledgerTxnId?investmentLedger.find(x=>x.id===e.ledgerTxnId):null;
  if(!paid){if(existing){removeLinkedBookkeepingTxn(existing);investmentLedger=investmentLedger.filter(x=>x.id!==existing.id);}e.ledgerTxnId=null;e.bookkeepingTxnId=null;return;}
  const meta=cachedSecurityMeta(e.symbol)||normalizeSecurityMeta({name:e.name,securityType:e.securityType},e.symbol);
  const t={id:existing?.id||e.ledgerTxnId||uid(),kind:'dividend',symbol:e.symbol,name:e.name||meta?.name||'',shortName:e.shortName||meta?.shortName||shortenSecurityName(e.name,e.symbol),securityType:e.securityType||meta?.securityType||'',title:'',date:e.actualPayDate,note:e.note||'',quantity:0,price:0,fee:0,tax:0,amount:ntd(e.actualAmount||0),feeMode:'auto',taxMode:'auto',ownedBy:'shared',status:'complete',createdAt:existing?.createdAt||e.createdAt||new Date().toISOString(),bookkeepingTxnId:existing?.bookkeepingTxnId||e.bookkeepingTxnId||null,source:'dividend-event',dividendEventId:e.id};
  if(existing)investmentLedger=investmentLedger.map(x=>x.id===existing.id?t:x);else investmentLedger.push(t);syncInvestmentBookkeeping(t,existing);e.ledgerTxnId=t.id;e.bookkeepingTxnId=t.bookkeepingTxnId;
}
async function saveDividendEvent(){
  const symbol=investmentAssetKey($('dividendSymbolInput').value),exDate=$('dividendExDateInput').value,expectedPayDate=$('dividendExpectedPayDateInput').value,actualPayDate=$('dividendActualPayDateInput').value,perShare=Number($('dividendPerShareInput').value||0),actualRaw=$('dividendActualAmountInput').value,note=$('dividendNoteInput').value.trim();
  if(!symbol){toast('請輸入股票代號');return;} if(!exDate&&!actualPayDate){toast('請輸入除息日；若是歷史已入帳股息，至少要有實際入帳日');return;} if(exDate&&expectedPayDate&&expectedPayDate<exDate){toast('預計入帳日不能早於除息日');return;} if(actualPayDate&&actualRaw===''){toast('已填實際入帳日，請一併輸入實收金額');return;}
  const old=dividendEventEditingId?dividendEvents.find(x=>x.id===dividendEventEditingId):null,meta=await resolveSecurityMeta(symbol).catch(()=>cachedSecurityMeta(symbol));
  const e={id:old?.id||uid(),symbol,name:meta?.name||$('dividendNameInput').value.trim(),shortName:meta?.shortName||shortenSecurityName($('dividendNameInput').value.trim(),symbol),securityType:meta?.securityType||guessSecurityType(symbol,$('dividendNameInput').value,meta?.market),exDate,expectedPayDate,actualPayDate,perShare:Math.max(0,perShare),actualAmount:actualRaw===''?null:ntd(actualRaw),statusOverride:old?.statusOverride||'',note,createdAt:old?.createdAt||new Date().toISOString(),ledgerTxnId:old?.ledgerTxnId||null,bookkeepingTxnId:old?.bookkeepingTxnId||null};
  if(old?.actualPayDate&&!actualPayDate&&old.ledgerTxnId&&!confirm('這筆股息原本已入帳。清除實際入帳日會同步刪除記帳本中的股息收入，確定繼續？'))return;
  syncDividendEventLedger(e); if(old)dividendEvents=dividendEvents.map(x=>x.id===old.id?e:x);else dividendEvents.push(e); await persistState();hide($('dividendEventEditorScreen'));renderAll();toast(e.actualPayDate?'股息已入帳並同步收入':'股息提醒已儲存');
}
async function deleteDividendEvent(){
  const e=dividendEvents.find(x=>x.id===dividendEventEditingId);if(!e)return;const linked=e.ledgerTxnId?investmentLedger.find(x=>x.id===e.ledgerTxnId):null;if(!confirm(`確定刪除「${e.symbol} 股息事件」？${linked?'\n\n已入帳的投資股息與記帳收入也會一併刪除。':''}`))return;
  if(linked){removeLinkedBookkeepingTxn(linked);investmentLedger=investmentLedger.filter(x=>x.id!==linked.id);}dividendEvents=dividendEvents.filter(x=>x.id!==e.id);await persistState();hide($('dividendEventEditorScreen'));renderAll();toast('股息事件已刪除');
}
async function confirmDividendEvent(id){
  const e=dividendEvents.find(x=>x.id===id);if(!e)return;const d=dividendDerived(e),suggested=d.estimatedAmount;
  if(suggested==null){openDividendEventEditor(id);toast('請先填每股股息或直接填實收金額',2600);return;}
  if(!confirm(`${e.symbol} ${e.shortName||e.name||''}\n預估股息 ${money(suggested)}\n\n確認今天已入帳？`)){openDividendEventEditor(id);return;}
  e.actualPayDate=dateKey(new Date());e.actualAmount=ntd(suggested);syncDividendEventLedger(e);await persistState();renderAll();toast('股息已確認並自動加入收入');
}
function renderDividendCalendar(){
  const box=$('investmentDividendEvents'),empty=$('investmentDividendEmpty'),status=$('investmentDividendSyncStatus');if(!box)return;box.innerHTML='';const today=dateKey(new Date()),rows=dividendEvents.map(e=>dividendDerived(e,today)).sort((a,b)=>String(b.actualPayDate||b.expectedPayDate||b.exDate).localeCompare(String(a.actualPayDate||a.expectedPayDate||a.exDate))).slice(0,12);empty.classList.toggle('hidden',rows.length>0);
  if(status){const generated=String(settings.dividendCalendarGeneratedAt||''),err=settings.dividendLastSyncError,last=String(settings.dividendLastSyncAt||'');status.textContent=err?'官方資料暫時無法更新，已保留既有行事曆':generated?`官方資料 ${generated.slice(0,10)} · App 最近同步 ${last?last.slice(0,10):'--'}`:'尚未同步官方股息行事曆';}
  rows.forEach(e=>{const row=document.createElement('button');row.type='button';row.className='investment-dividend-row';const amount=e.status==='paid'?e.actualAmount:e.estimatedAmount,payText=e.actualPayDate?`入帳 ${escapeHtml(e.actualPayDate)}`:e.expectedPayDate?`預計 ${escapeHtml(e.expectedPayDate)}`:'入帳日待補';const sourceTag=e.source==='official-auto'?' · 自動':'';row.innerHTML=`<span class="investment-dividend-icon">${dividendStatusIcon(e.status)}</span><span class="investment-dividend-main"><strong>${escapeHtml(investmentDisplayLabel(e.symbol,e.name,e.shortName))}</strong><small>除息 ${escapeHtml(e.exDate||'--')} · ${payText}</small><em>${escapeHtml(dividendStatusLabel(e.status))}${e.entitledShares?` · ${e.entitledShares.toLocaleString('zh-TW',{maximumFractionDigits:4})} 股`:''}${sourceTag}</em></span><b>${amount==null?'--':investmentPrivateMoney(amount)}</b>`;row.onclick=()=>openDividendEventEditor(e.id);box.appendChild(row);});
}
function renderAnnualSummaries(){
  const box=$('investmentAnnualSummaryList'),empty=$('investmentAnnualSummaryEmpty');if(!box)return;box.innerHTML='';const rows=annualIncomeSummaries.slice().sort((a,b)=>b.year-a.year);empty.classList.toggle('hidden',rows.length>0);rows.forEach(a=>{const row=document.createElement('button');row.type='button';row.className='annual-summary-row';row.innerHTML=`<div><strong>${a.year} 年</strong><span>股息收入 ${investmentPrivateMoney(a.dividendIncome)} · 老婆分紅 ${investmentPrivateMoney(a.spouseBonus)}</span></div><b>${investmentPrivateMoney(a.dividendIncome+a.spouseBonus)}</b><em>›</em>`;row.onclick=()=>openAnnualSummaryEditor(a.year);box.appendChild(row);});
}
function openAnnualSummaryEditor(year=null){
  const y=Number(year)||new Date().getFullYear()-1,a=annualSummaryForYear(y);annualSummaryEditingYear=a?.year||null;$('annualSummaryYearInput').value=String(a?.year||y);$('annualSummaryDividendInput').value=a?.dividendIncome||'';$('annualSummarySpouseInput').value=a?.spouseBonus||'';$('annualSummaryNoteInput').value=a?.note||'';$('deleteAnnualSummaryBtn').classList.toggle('hidden',!a);show($('annualSummaryEditorScreen'));
}
async function saveAnnualSummary(){
  const year=Number($('annualSummaryYearInput').value),dividendIncome=ntd($('annualSummaryDividendInput').value||0),spouseBonus=ntd($('annualSummarySpouseInput').value||0),note=$('annualSummaryNoteInput').value.trim();if(!Number.isInteger(year)||year<1900||year>2200){toast('請輸入正確年份');return;}
  const detailed=detailedDividendIncomeForYear(year);if(dividendIncome>0&&detailed>0&&!annualSummaryForYear(year)){if(!confirm(`${year} 年已經有逐筆股息 ${money(detailed)}。\n\n年度股息摘要不會和逐筆股息相加，但為避免混淆，仍建議同一年只選一種方式。確定建立年度摘要？`))return;}
  const row={year,dividendIncome,spouseBonus,note,updatedAt:new Date().toISOString()};annualIncomeSummaries=annualIncomeSummaries.filter(x=>x.year!==annualSummaryEditingYear&&x.year!==year);annualIncomeSummaries.push(row);await persistState();hide($('annualSummaryEditorScreen'));renderAll();toast('年度收入摘要已儲存');
}
async function deleteAnnualSummary(){const y=annualSummaryEditingYear;if(!y)return;if(!confirm(`刪除 ${y} 年度收入摘要？逐筆記帳與投資交易不會受影響。`))return;annualIncomeSummaries=annualIncomeSummaries.filter(x=>x.year!==y);await persistState();hide($('annualSummaryEditorScreen'));renderAll();toast('年度摘要已刪除');}
function openInvestmentReturnDetail(year=new Date().getFullYear()){
  investmentReturnDetailYear=Number(year)||new Date().getFullYear();renderInvestmentReturnDetail();show($('investmentReturnDetailScreen'));
}
function closeInvestmentReturnDetail(){hide($('investmentReturnDetailScreen'));}
function renderInvestmentReturnDetail(){
  const y=investmentReturnDetailYear,r=investmentYearReturn(y);if(!r)return;
  $('investmentReturnDetailTitle').textContent=`${y}${y===new Date().getFullYear()?' YTD':''} XIRR`;
  const g=investmentYearAssetGrowth(y);
  $('investmentReturnOpening').textContent=r.missingBoundary?.length?'待補年末價':investmentPrivateMoney(r.opening);
  $('investmentReturnClosing').textContent=investmentPrivateMoney(r.closing);
  $('investmentReturnRate').textContent=r.missingBoundary?.length?'待補年末價':r.hasUnresolved?'待補資料':investmentPrivatePct(r.rate);setInvestmentGainTone($('investmentReturnRate'),r.rate);
  $('investmentReturnAssetGrowth').textContent=r.missingBoundary?.length||!Number.isFinite(g?.assetGrowthRate)?'--':`${g.assetGrowthRate>=0?'+':''}${(g.assetGrowthRate*100).toFixed(1)}%`;setInvestmentGainTone($('investmentReturnAssetGrowth'),g?.assetGrowthRate);
  $('investmentReturnCreatedGain').textContent=r.missingBoundary?.length?'--':investmentPrivateMoney(g?.investmentGain||0);setInvestmentGainTone($('investmentReturnCreatedGain'),r.missingBoundary?.length?null:g?.investmentGain);
  const status=$('investmentReturnDetailStatus'),messages=[];
  if(r.missingBoundary?.length)messages.push(`缺少 ${[...new Set(r.missingBoundary)].join('、')} 的年度邊界收盤價，XIRR 暫不計算。`);
  if(r.hasCostPending)messages.push('仍有成本待補交易。');if(r.hasContribution)messages.push('仍有只知道投入金額、尚未完成成交資訊的紀錄。');
  status.classList.toggle('hidden',messages.length===0);status.textContent=messages.join(' ');
  const box=$('investmentReturnCashFlows');box.innerHTML='';
  if(!r.flows.length){box.innerHTML='<div class="empty-mini">目前沒有足夠現金流可計算。</div>';}
  else r.flows.forEach(f=>{const row=document.createElement('div');row.className='investment-return-cashflow-row';const out=Number(f.amount)<0;row.innerHTML=`<span>${escapeHtml(f.date)}</span><div><strong>${escapeHtml(f.label||f.type||'現金流')}</strong>${f.symbol?`<small>${escapeHtml(f.symbol)}</small>`:''}</div><b class="${out?'out':'in'}">${out?'-':'+'}${investmentPrivateMoney(Math.abs(f.amount))}</b>`;box.appendChild(row);});
}
async function refreshInvestmentBoundaryPrices(){
  toast('正在取得年末收盤價…',1400);const changed=await ensureYearBoundaryPrices(investmentReturnDetailYear,{force:true});renderInvestmentReturnDetail();renderInvestment();toast(changed?'年末收盤價已更新':'已檢查年末收盤價',1800);
}
function investmentToneClass(value){
  if(!Number.isFinite(Number(value))||Number(value)===0)return'';return Number(value)>0?'investment-gain':'investment-loss';
}
function investmentRealizedCardHtml(r){
  const label=investmentDisplayLabel(r.symbol,r.name,r.shortName),tone=investmentToneClass(r.realized),ret=investmentPrivatePct(r.returnRate);
  const fifo=r.matches.map(m=>`<div class="fifo-match-row"><span>${escapeHtml(m.date)} · ${Number(m.quantity||0).toLocaleString('zh-TW',{maximumFractionDigits:4})} 股</span><b>${m.costBasis==null?'成本待補':investmentPrivateMoney(m.costBasis)}</b></div>`).join('');
  return `<details class="investment-realized-card ${r.realized>0?'is-gain':r.realized<0?'is-loss':''}"><summary><div><span>${escapeHtml(label)}</span><strong>賣出 ${Number(r.quantity||0).toLocaleString('zh-TW',{maximumFractionDigits:4})} 股 @ ${investmentPrice(r.sellPrice)}</strong><small>${escapeHtml(r.date)} · 淨回收 ${investmentPrivateMoney(r.proceeds)}</small></div><div class="investment-realized-card-result"><strong class="${tone}">${r.realized==null?'成本待補':investmentPrivateMoney(r.realized)}</strong><small class="${tone}">${ret}</small></div></summary><div class="investment-realized-breakdown"><div><span>賣出總額</span><b>${investmentPrivateMoney(r.gross)}</b></div><div><span>手續費</span><b>${investmentPrivateMoney(r.fee)}</b></div><div><span>證交稅</span><b>${investmentPrivateMoney(r.tax)}</b></div><div><span>FIFO 取得成本</span><b>${r.costBasis==null?'成本待補':investmentPrivateMoney(r.costBasis)}</b></div><div class="fifo-title">FIFO 成本來源</div>${fifo||'<div class="fifo-match-row"><span>無成本批次</span><b>--</b></div>'}</div></details>`;
}
function setInvestmentDetailTab(tab='overview'){
  investmentDetailTab=['overview','trades','dividends','realized'].includes(tab)?tab:'overview';
  document.querySelectorAll('[data-investment-detail-tab]').forEach(b=>b.classList.toggle('active',b.dataset.investmentDetailTab===investmentDetailTab));
  const panels={overview:'investmentDetailTabOverview',trades:'investmentDetailTabTrades',dividends:'investmentDetailTabDividends',realized:'investmentDetailTabRealized'};
  Object.entries(panels).forEach(([key,id])=>$(id)?.classList.toggle('hidden',key!==investmentDetailTab));
}
function renderInvestmentSecurityRealized(symbol){
  const rows=investmentRealizedTransactions({symbol}),box=$('investmentDetailRealizedList'),empty=$('investmentDetailRealizedEmpty'),summary=$('investmentDetailRealizedSummary');
  if(!box)return;box.innerHTML=rows.map(investmentRealizedCardHtml).join('');empty?.classList.toggle('hidden',rows.length>0);
  const complete=rows.filter(r=>!r.incomplete),total=complete.length===rows.length?ntd(complete.reduce((s,r)=>s+Number(r.realized||0),0)):null,wins=complete.filter(r=>r.realized>0).length;
  if(summary)summary.innerHTML=`<div><span>累計已實現</span><strong class="${investmentToneClass(total)}">${total==null?'成本待補':investmentPrivateMoney(total)}</strong></div><div><span>賣出交易</span><strong>${rows.length} 筆</strong></div><div><span>勝率</span><strong>${complete.length?`${(wins/complete.length*100).toFixed(1)}%`:'--'}</strong></div>`;
}
function investmentRealizedYears(){
  const years=new Set(investmentRealizedTransactions().map(r=>Number(String(r.date).slice(0,4))));years.add(new Date().getFullYear());return [...years].filter(Number.isFinite).sort((a,b)=>b-a);
}
function openInvestmentRealizedDetail(year=new Date().getFullYear(),symbol=''){
  investmentRealizedYear=Number(year)||new Date().getFullYear();investmentRealizedSymbol=investmentAssetKey(symbol);investmentRealizedOutcome='all';renderInvestmentRealizedDetail();show($('investmentRealizedScreen'));window.scrollTo({top:0,behavior:'auto'});
}
function renderInvestmentRealizedDetail(){
  const years=investmentRealizedYears(),ys=$('investmentRealizedYearInput');if(!ys)return;
  ys.innerHTML=years.map(y=>`<option value="${y}">${y}${y===new Date().getFullYear()?'（今年）':''}</option>`).join('');ys.value=String(years.includes(investmentRealizedYear)?investmentRealizedYear:years[0]);investmentRealizedYear=Number(ys.value);
  const yearRows=investmentRealizedTransactions({year:investmentRealizedYear}),symbols=[...new Map(yearRows.map(r=>[r.symbol,investmentDisplayLabel(r.symbol,r.name,r.shortName)])).entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  const ss=$('investmentRealizedSymbolInput'),previous=investmentRealizedSymbol;ss.innerHTML='<option value="">全部標的</option>'+symbols.map(([s,n])=>`<option value="${escapeHtml(s)}">${escapeHtml(n)}</option>`).join('');ss.value=symbols.some(([s])=>s===previous)?previous:'';investmentRealizedSymbol=ss.value;
  $('investmentRealizedOutcomeInput').value=investmentRealizedOutcome;
  let rows=yearRows.filter(r=>!investmentRealizedSymbol||r.symbol===investmentRealizedSymbol);
  if(investmentRealizedOutcome==='gain')rows=rows.filter(r=>r.realized>0);else if(investmentRealizedOutcome==='loss')rows=rows.filter(r=>r.realized<0);
  const complete=rows.filter(r=>!r.incomplete),incomplete=rows.some(r=>r.incomplete),total=incomplete?null:ntd(complete.reduce((s,r)=>s+Number(r.realized||0),0)),wins=complete.filter(r=>r.realized>0).length,losses=complete.filter(r=>r.realized<0).length,winRate=complete.length?wins/complete.length:null;
  $('investmentRealizedHeroLabel').textContent=`${investmentRealizedYear} 已實現損益`;
  $('investmentRealizedHeroTotal').textContent=total==null?'待補成本':investmentPrivateMoney(total);$('investmentRealizedHeroTotal').className=investmentToneClass(total);
  $('investmentRealizedHeroMeta').textContent=`${rows.length} 筆賣出${investmentRealizedSymbol?` · ${investmentRealizedSymbol}`:''}`;
  $('investmentRealizedWinRate').textContent=winRate==null?'--':investmentPrivatePct(winRate);
  const best=complete.slice().sort((a,b)=>Number(b.realized)-Number(a.realized))[0],worst=complete.slice().sort((a,b)=>Number(a.realized)-Number(b.realized))[0];
  $('investmentRealizedStats').innerHTML=[['獲利交易',`${wins} 筆`,''],['虧損交易',`${losses} 筆`,''],['最大獲利',best&&best.realized>0?investmentPrivateMoney(best.realized):'$0','investment-gain'],['最大虧損',worst&&worst.realized<0?investmentPrivateMoney(worst.realized):'$0','investment-loss']].map(([k,v,c])=>`<div><span>${k}</span><strong class="${c}">${v}</strong></div>`).join('');
  const grouped=new Map();for(const r of rows){if(!grouped.has(r.symbol))grouped.set(r.symbol,{symbol:r.symbol,name:r.name,shortName:r.shortName,total:0,incomplete:false,count:0});const g=grouped.get(r.symbol);g.count++;if(r.incomplete)g.incomplete=true;else g.total+=Number(r.realized||0);}
  $('investmentRealizedBySymbol').innerHTML=[...grouped.values()].sort((a,b)=>Math.abs(b.total)-Math.abs(a.total)).map(g=>`<button type="button" class="investment-realized-symbol-row" data-realized-symbol="${escapeHtml(g.symbol)}"><div><strong>${escapeHtml(investmentDisplayLabel(g.symbol,g.name,g.shortName))}</strong><small>${g.count} 筆賣出</small></div><b class="${investmentToneClass(g.total)}">${g.incomplete?'待補成本':investmentPrivateMoney(g.total)}</b><span>›</span></button>`).join('');
  $('investmentRealizedBySymbol').querySelectorAll('[data-realized-symbol]').forEach(b=>b.onclick=()=>{investmentRealizedSymbol=b.dataset.realizedSymbol;renderInvestmentRealizedDetail();});
  $('investmentRealizedList').innerHTML=rows.map(investmentRealizedCardHtml).join('');$('investmentRealizedEmpty').classList.toggle('hidden',rows.length>0);
}

function openInvestmentSecurityDetail(symbol){investmentDetailSymbol=investmentAssetKey(symbol);investmentDetailTab='overview';renderInvestmentSecurityDetail();show($('investmentSecurityDetailScreen'));setInvestmentDetailTab('overview');}
function renderInvestmentSecurityDetail(){
  const symbol=investmentDetailSymbol;if(!symbol)return;
  const today=dateKey(new Date()),p=investmentPortfolio(today).positions.find(x=>x.symbol===symbol),meta=cachedSecurityMeta(symbol),name=p?.name||meta?.name||symbol,shortName=p?.shortName||meta?.shortName||name,perf=investmentSecurityCumulativePerformance(symbol,today);
  $('investmentDetailTitle').textContent=investmentDisplayLabel(symbol,name,shortName);$('investmentDetailName').textContent='總報酬＝已實現＋未實現＋已領股息；已實現損益採 FIFO 先進先出。';
  const year=new Date().getFullYear(),divs=investmentLedger.filter(t=>!t.voided&&t.kind==='dividend'&&t.symbol===symbol),yearDiv=divs.filter(t=>Number(String(t.date).slice(0,4))===year).reduce((a,t)=>a+investmentTxnCash(t),0),allDiv=divs.reduce((a,t)=>a+investmentTxnCash(t),0),xirrLabel=perf.xirrIncomplete?'待補年末價':investmentPrivatePct(perf.xirr);
  const allRealizedRows=investmentRealizedTransactions({symbol}),realizedIncomplete=allRealizedRows.some(r=>r.incomplete),allRealized=realizedIncomplete?null:ntd(allRealizedRows.reduce((s,r)=>s+Number(r.realized||0),0)),totalProfit=(p?.unrealized==null||allRealized==null)?null:ntd(Number(p?.unrealized||0)+allRealized+allDiv);
  $('investmentDetailTotalProfit').textContent=totalProfit==null?'待補成本':investmentPrivateMoney(totalProfit);$('investmentDetailTotalProfit').className=investmentToneClass(totalProfit);
  $('investmentDetailTotalReturn').textContent=`含息總報酬率 ${investmentPrivatePct(perf.totalReturn)}`;$('investmentDetailTotalReturn').className=investmentToneClass(perf.totalReturn);
  $('investmentDetailHeroShares').textContent=`${Number(p?.quantity||0).toLocaleString('zh-TW',{maximumFractionDigits:4})} 股`;
  $('investmentDetailHeroAvg').textContent=p?.costIncomplete?'均價待補':`均價 ${p?.avgCost==null?'--':(investmentValuesVisible?investmentPrice(p.avgCost):'****')}`;
  $('investmentDetailUnrealized').textContent=p?.unrealized==null?'成本待補':investmentPrivateMoney(p.unrealized);$('investmentDetailUnrealized').className=investmentToneClass(p?.unrealized);
  $('investmentDetailRealized').textContent=allRealized==null?'成本待補':investmentPrivateMoney(allRealized);$('investmentDetailRealized').className=investmentToneClass(allRealized);
  $('investmentDetailAllDividend').textContent=investmentPrivateMoney(allDiv);
  const detailStats=[['目前市值',p?investmentPrivateMoney(p.marketValue):'$0',''],['平均成本',p?(p.costIncomplete?'成本待補':investmentValuesVisible?investmentPrice(p.avgCost):'****'):'--',''],['純報酬率',investmentPrivatePct(perf.priceReturn),investmentToneClass(perf.priceReturn)],['含息總報酬率',investmentPrivatePct(perf.totalReturn),investmentToneClass(perf.totalReturn)],['年化 XIRR',xirrLabel,investmentToneClass(perf.xirr)],[`${year} 已領股息`,investmentPrivateMoney(yearDiv),'']];
  $('investmentDetailStats').innerHTML=detailStats.map(([k,v,c])=>`<div><span>${k}</span><strong class="${c}">${v}</strong></div>`).join('');
  if(perf.xirrIncomplete&&perf.trackingStart){const y=Number(perf.trackingStart.slice(0,4));setTimeout(()=>ensureYearBoundaryPrices(y).then(changed=>{if(changed&&investmentDetailSymbol===symbol)renderInvestmentSecurityDetail();}),0);}
  const dbox=$('investmentDetailDividends');dbox.innerHTML='';const events=dividendEvents.filter(e=>e.symbol===symbol).map(e=>dividendDerived(e)).sort((a,b)=>String(b.actualPayDate||b.expectedPayDate||b.exDate).localeCompare(String(a.actualPayDate||a.expectedPayDate||a.exDate)));events.forEach(e=>{const b=document.createElement('button');b.type='button';b.className='detail-mini-row';const amt=e.status==='paid'?e.actualAmount:e.estimatedAmount;b.innerHTML=`<span>${dividendStatusIcon(e.status)}</span><div><strong>${escapeHtml(dividendStatusLabel(e.status))}</strong><small>除息 ${escapeHtml(e.exDate||'--')} · ${e.actualPayDate?`入帳 ${escapeHtml(e.actualPayDate)}`:`預計 ${escapeHtml(e.expectedPayDate||'--')}`}</small></div><b>${amt==null?'--':investmentPrivateMoney(amt)}</b>`;b.onclick=()=>openDividendEventEditor(e.id);dbox.appendChild(b);});$('investmentDetailDividendEmpty').classList.toggle('hidden',events.length>0);
  const tbox=$('investmentDetailTrades');tbox.innerHTML='';const trades=investmentLedger.filter(t=>!t.voided&&t.symbol===symbol&&t.kind!=='dividend').slice().sort((a,b)=>b.date.localeCompare(a.date));trades.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='detail-mini-row';const detail=t.costPending?` · ${Number(t.quantity||0).toLocaleString('zh-TW',{maximumFractionDigits:4})} 股 · 成本待補`:['initial','buy','sell'].includes(t.kind)?` · ${Number(t.quantity||0).toLocaleString('zh-TW',{maximumFractionDigits:4})} 股 @ ${investmentPrice(t.price)}`:'';b.innerHTML=`<span>${investmentKindIcon(t.kind)}</span><div><strong>${investmentKindLabel(t.kind)}${t.costPending?' · 成本待補':''}</strong><small>${escapeHtml(t.date)}${t.datePending?' · 日期待補':''}${detail}</small></div><b>${t.costPending?'待補':investmentPrivateMoney(investmentTxnCash(t))}</b>`;b.onclick=()=>openInvestmentTxnEditor(t.id);tbox.appendChild(b);});$('investmentDetailTradeEmpty').classList.toggle('hidden',trades.length>0);
  renderInvestmentSecurityRealized(symbol);
  const q=investmentLatestQuote(symbol);$('investmentDetailQuote').textContent=q?`${investmentPrice(q.price)} · ${q.date} 收盤`:'尚無收盤價';$('investmentDetailIntraday').textContent='GitHub Pages 每日收盤檔';setInvestmentDetailTab(investmentDetailTab);
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

async function exportBackup(){ settings.lastBackupAt=new Date().toISOString();await persistState();const data={app:'little-days-bookkeeping',version:APP_VERSION,dataVersion:DATA_VERSION,exportedAt:settings.lastBackupAt,txns,budgets,categories,quickTemplates,settings,recurring,investmentLedger,investmentQuotes,dividendEvents,annualIncomeSummaries};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`小日子記帳備份_${dateKey(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);renderBackupStatus();toast('備份檔已產生，請妥善保存'); }
async function importBackupFile(file){
  try{
    const data=JSON.parse(await file.text());
    if(data.app!=='little-days-bookkeeping'||!Array.isArray(data.txns))throw new Error('bad');
    const mergeOnly=Boolean(data.mergeOnly),repairOnly=Boolean(data.repairOnly);
    const deleteTxnIds=new Set(Array.isArray(data.deleteTxnIds)?data.deleteTxnIds:[]);
    const deleteInvestmentLedgerIds=new Set(Array.isArray(data.deleteInvestmentLedgerIds)?data.deleteInvestmentLedgerIds:[]);
    const deleteInvestmentQuoteIds=new Set(Array.isArray(data.deleteInvestmentQuoteIds)?data.deleteInvestmentQuoteIds:[]);
    const deleteDividendEventIds=new Set(Array.isArray(data.deleteDividendEventIds)?data.deleteDividendEventIds:[]);
    const deletionCount=deleteTxnIds.size+deleteInvestmentLedgerIds.size+deleteInvestmentQuoteIds.size+deleteDividendEventIds.size;
    const label=data.importLabel?`\n\n${data.importLabel}`:'';
    const question=repairOnly
      ?`套用這份私人資料修復檔？\n將清理 ${deletionCount} 筆舊的占位／待配對資料，其他記帳不受影響。${label}`
      :`匯入 ${data.txns.length} 筆紀錄？目前資料會以 ID 合併。${mergeOnly?'\n這是私人一次性資料檔，不會覆蓋其他設定。':''}${label}`;
    if(!confirm(question))return;

    if(deleteTxnIds.size)txns=txns.filter(t=>!deleteTxnIds.has(t.id));
    if(deleteInvestmentLedgerIds.size)investmentLedger=investmentLedger.filter(t=>!deleteInvestmentLedgerIds.has(t.id));
    if(deleteInvestmentQuoteIds.size)investmentQuotes=investmentQuotes.filter(t=>!deleteInvestmentQuoteIds.has(t.id));
    if(deleteDividendEventIds.size)dividendEvents=dividendEvents.filter(t=>!deleteDividendEventIds.has(t.id));

    const map=new Map(txns.map(t=>[t.id,t]));data.txns.forEach(t=>map.set(t.id||uid(),t));txns=[...map.values()];
    if(mergeOnly){
      if(Array.isArray(data.recurring)){const rmap=new Map(recurring.map(r=>[r.id,r]));data.recurring.forEach(r=>rmap.set(r.id||uid(),r));recurring=[...rmap.values()];}
      if(Array.isArray(data.investmentLedger)){const imap=new Map(investmentLedger.map(r=>[r.id,r]));data.investmentLedger.forEach(r=>imap.set(r.id||uid(),r));investmentLedger=[...imap.values()];}
      if(Array.isArray(data.investmentQuotes)){const qmap=new Map(investmentQuotes.map(r=>[r.id,r]));data.investmentQuotes.forEach(r=>qmap.set(r.id||uid(),r));investmentQuotes=[...qmap.values()];}
      if(Array.isArray(data.dividendEvents)){const dmap=new Map(dividendEvents.map(r=>[r.id,r]));data.dividendEvents.forEach(r=>dmap.set(r.id||uid(),r));dividendEvents=[...dmap.values()];}
      if(Array.isArray(data.annualIncomeSummaries)){const amap=new Map(annualIncomeSummaries.map(r=>[Number(r.year),r]));data.annualIncomeSummaries.forEach(r=>amap.set(Number(r.year),r));annualIncomeSummaries=[...amap.values()];}
      settings={...settings,lastRestoreAt:new Date().toISOString()};
    }else{
      budgets={...budgets,...(data.budgets||{})};
      if(Array.isArray(data.categories)&&data.categories.length)categories=data.categories;
      if(Array.isArray(data.quickTemplates)&&data.quickTemplates.length)quickTemplates=data.quickTemplates;
      if(Array.isArray(data.recurring))recurring=data.recurring;
      if(Array.isArray(data.investmentLedger))investmentLedger=data.investmentLedger;
      if(Array.isArray(data.investmentQuotes))investmentQuotes=data.investmentQuotes;
      if(Array.isArray(data.dividendEvents))dividendEvents=data.dividendEvents;
      if(Array.isArray(data.annualIncomeSummaries))annualIncomeSummaries=data.annualIncomeSummaries;
      settings={...settings,...(data.settings||{}),lastRestoreAt:new Date().toISOString()};
    }
    normalizeData();migrateHistoricalCategorySummaries();normalizeData();migrateCategoriesV156();normalizeData();
    await persistState();renderAll();renderBackupStatus();
    toast(repairOnly?'私人資料修復完成':mergeOnly?'私人資料合併完成':'備份還原完成');
  }catch(e){
    console.error(e);toast('這不是有效的記帳備份檔',2600);
  }
}

function bindEvents(){
  $('prevMonthBtn').onclick=()=>{viewMonth=addMonths(viewMonth,-1);selectedDate=dateKey(viewMonth);renderAll();}; $('nextMonthBtn').onclick=()=>{viewMonth=addMonths(viewMonth,1);selectedDate=dateKey(viewMonth);renderAll();};
  $('addFromDayBtn').onclick=()=>openEditor(null,selectedDate); $('manualAddNav').onclick=()=>openEditor(null,selectedDate); document.querySelectorAll('.manual-add-clone').forEach(b=>b.onclick=()=>openEditor(null,selectedDate));
  $('voiceFab').onclick=handleVoiceFabClick; $('closeVoiceBtn').onclick=()=>closeVoiceSheet(true); $('finishVoiceBtn').onclick=finishVoice; $('voiceFallbackBtn').onclick=()=>{show($('voiceFallbackInput'));$('voiceFallbackInput').focus();};
  $('amountInput').onclick=openCalculator; $('amountCalcBtn').onclick=openCalculator; $('closeCalculatorBtn').onclick=closeCalculator; $('applyCalculatorBtn').onclick=applyCalculator; $('calculatorPad').onclick=e=>{const b=e.target.closest('button[data-calc]');if(b)calculatorKey(b.dataset.calc);};
  $('cancelVoiceDraftBtn').onclick=closeVoiceDrafts; $('saveVoiceDraftBtn').onclick=saveVoiceDrafts; $('voiceDraftList').onclick=e=>{const edit=e.target.closest('[data-voice-edit]'),remove=e.target.closest('[data-voice-remove]');if(edit){openVoiceDraftItemEditor(Number(edit.dataset.voiceEdit));return;}if(remove){voiceDraftItems.splice(Number(remove.dataset.voiceRemove),1);renderVoiceDrafts();}}; $('cancelVoiceDraftEditBtn').onclick=()=>hide($('voiceDraftEditScreen')); $('saveVoiceDraftEditBtn').onclick=saveVoiceDraftItemEdit; $('voiceDraftEditCategory').onchange=()=>renderVoiceDraftEditSubcategories();
  $('cancelEditBtn').onclick=closeEditor; $('saveTxnBtn').onclick=saveTxn; $('expenseTypeBtn').onclick=()=>setEditType('expense'); $('incomeTypeBtn').onclick=()=>setEditType('income'); $('investmentTypeBtn').onclick=()=>setEditType('investment'); document.querySelectorAll('[data-payment]').forEach(b=>b.onclick=()=>setPayment(b.dataset.payment));
  $('subcategoryPickerBtn').onclick=openSubcategoryPicker; $('closeSubcategorySheetBtn').onclick=()=>hide($('subcategorySheet')); $('subcategorySheet').addEventListener('click',e=>{if(e.target===$('subcategorySheet'))hide($('subcategorySheet'));}); installAnalysisSwipe();
  $('closeTxnMenuBtn').onclick=closeTxnMenu; $('editTxnBtn').onclick=()=>{const t=txns.find(x=>x.id===actionTxnId);if(!t)return;const linked=bookkeepingLinkTarget(t);if(isCompletedInvestmentBuy(linked)){closeTxnMenu();openInvestmentTxnEditor(linked.id);return;}if(t.recurringId)openRecurringEditScope();else{closeTxnMenu();openEditor(t);}}; $('deleteTxnBtn').onclick=deleteTxn; $('deleteOccurrenceBtn').onclick=deleteOccurrenceOnly; $('stopRecurringFromBtn').onclick=stopRecurringFromOccurrence; $('cancelRecurringDeleteBtn').onclick=closeRecurringDelete; $('editOccurrenceOnlyBtn').onclick=editOccurrenceOnly; $('editRecurringFromBtn').onclick=editRecurringFromOccurrence; $('cancelRecurringEditScopeBtn').onclick=closeRecurringEditScope;
  $('editBudgetBtn').onclick=openBudgetEditor; $('cancelBudgetBtn').onclick=()=>hide($('budgetEditorScreen')); $('saveBudgetBtn').onclick=saveBudgetEditor; $('closeInsightDetailBtn').onclick=closeInsightDetail; $('insightDetailAnalysisBtn').onclick=()=>{closeInsightDetail();setPage('analysis');}; $('goAnalysisBtn').onclick=()=>setPage('analysis'); document.querySelectorAll('.summary-action[data-insight]').forEach(b=>b.onclick=()=>{homeInsightMode=b.dataset.insight;renderHome();}); document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>setPage(b.dataset.page)); document.querySelectorAll('[data-back-home]').forEach(b=>b.onclick=()=>setPage('home'));
  $('openSettingsBtn').onclick=()=>{renderBackupStatus();show($('settingsScreen'));}; $('closeSettingsBtn').onclick=returnHomeFromSettings; $('manageBudgetBtn').onclick=()=>{hide($('settingsScreen'));setPage('budget');}; $('settingsHomeBtn').onclick=returnHomeFromSettings; $('updateHomeBtn').onclick=returnHomeFromSettings; $('checkUpdateBtn').onclick=checkForUpdate; $('updateNowBtn').onclick=updateNow; $('exportBtn').onclick=exportBackup; $('importBtn').onclick=()=>$('importFileInput').click(); $('importFileInput').onchange=e=>{const f=e.target.files?.[0];if(f)importBackupFile(f);e.target.value='';};
  $('manageQuickTemplatesBtn').onclick=openQuickTemplateManager; $('manageQuickTemplatesHomeBtn').onclick=openQuickTemplateManager; $('closeQuickTemplateManagerBtn').onclick=()=>hide($('quickTemplateManagerScreen')); $('addQuickTemplateBtn').onclick=()=>openQuickTemplateEditor(); $('cancelQuickTemplateEditBtn').onclick=()=>hide($('quickTemplateEditorScreen')); $('saveQuickTemplateBtn').onclick=saveQuickTemplate; $('quickTemplateTypeInput').onchange=syncQuickTemplateTypeFields; $('quickTemplateCategoryInput').onchange=()=>renderQuickTemplateSubcategories();
  $('wipeBtn').onclick=async()=>{if(confirm('確定要清除全部記帳資料、預算、自訂類別與投資帳本？安全密碼與 Face ID 設定會保留。')){txns=[];budgets={};categories=clone(DEFAULT_CATEGORIES);quickTemplates=clone(DEFAULT_QUICK_TEMPLATES);settings={};recurring=[];investmentLedger=[];investmentQuotes=[];dividendEvents=[];annualIncomeSummaries=[];await persistState();hide($('settingsScreen'));renderAll();toast('已清除');}};
  $('manageCategoriesBtn').onclick=openCategoryManager; $('manageCategoriesInlineBtn').onclick=openCategoryManager; $('closeCategoryManagerBtn').onclick=()=>hide($('categoryManagerScreen')); $('addCategoryBtn').onclick=()=>openCategoryEditor(); $('cancelCategoryEditBtn').onclick=()=>hide($('categoryEditorScreen')); $('saveCategoryBtn').onclick=saveCategory;
  $('dateInput').addEventListener('change',updateEditorDateContext); $('editorRecurringInput').onchange=toggleEditorRecurringFields; $('editorRecurringFrequency').onchange=updateEditorRecurringHint; $('editorAddMonthlyDayBtn').onclick=addEditorMonthlyDay; $('editorRecurringMonthlyDayInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addEditorMonthlyDay();}});
  for(let m=0;m<12;m++){const o=document.createElement('option');o.value=String(m);o.textContent=`${m+1} 月`;$('analysisMonthSelect').appendChild(o);}
  $('analysisPrevYearBtn').onclick=()=>{analysisYear--;renderAnalysis();}; $('analysisNextYearBtn').onclick=()=>{analysisYear++;renderAnalysis();}; $('analysisYearModeBtn').onclick=()=>{analysisMode='year';renderAnalysis();}; $('analysisMonthModeBtn').onclick=()=>{analysisMode='month';renderAnalysis();}; $('analysisMonthSelect').onchange=e=>{analysisMonth=Number(e.target.value);renderAnalysis();};
  $('manageRecurringBtn').onclick=openRecurringManager; $('closeRecurringManagerBtn').onclick=()=>hide($('recurringManagerScreen')); $('addRecurringBtn').onclick=()=>openRecurringEditor(); $('cancelRecurringEditBtn').onclick=()=>{recurringSplitSourceId=null;recurringSplitEffectiveDate='';$('recurringStartDateInput').disabled=false;hide($('recurringEditorScreen'));}; $('saveRecurringBtn').onclick=saveRecurring; $('recurringExpenseTypeBtn').onclick=()=>setRecurringType('expense'); $('recurringIncomeTypeBtn').onclick=()=>setRecurringType('income'); $('recurringInvestmentTypeBtn').onclick=()=>setRecurringType('investment'); $('recurringFrequencyInput').onchange=updateRecurringFrequencyFields; $('recurringAddMonthlyDayBtn').onclick=addRecurringMonthlyDay; $('recurringMonthlyDayInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addRecurringMonthlyDay();}}); $('recurringCategoryInput').onchange=()=>renderRecurringSubcategories(); document.querySelectorAll('[data-recurring-payment]').forEach(b=>b.onclick=()=>setRecurringPayment(b.dataset.recurringPayment));
    $('addInvestmentTxnBtn').onclick=()=>openInvestmentTxnEditor(); $('investmentAddHoldingBtn').onclick=()=>openInvestmentTxnEditor(); $('cancelInvestmentTxnBtn').onclick=()=>hide($('investmentTxnEditorScreen')); $('saveInvestmentTxnBtn').onclick=saveInvestmentTxn; $('deleteInvestmentTxnBtn').onclick=deleteInvestmentTxn; $('investmentTxnKindInput').onchange=syncInvestmentTxnFields; $('investmentSymbolInput').addEventListener('input',scheduleInvestmentSymbolLookup); $('investmentSymbolInput').addEventListener('blur',()=>refreshInvestmentSymbolMeta(false)); $('bookkeepingInvestmentSymbolInput').addEventListener('input',()=>scheduleSimpleSecurityMeta('bookkeepingInvestmentSymbolInput','bookkeepingInvestmentMetaStatus')); $('bookkeepingInvestmentSymbolInput').addEventListener('blur',()=>refreshSimpleSecurityMeta('bookkeepingInvestmentSymbolInput','bookkeepingInvestmentMetaStatus')); $('recurringInvestmentSymbolInput').addEventListener('input',()=>scheduleSimpleSecurityMeta('recurringInvestmentSymbolInput','recurringInvestmentMetaStatus')); $('recurringInvestmentSymbolInput').addEventListener('blur',()=>refreshSimpleSecurityMeta('recurringInvestmentSymbolInput','recurringInvestmentMetaStatus')); ['investmentQuantityInput','investmentTxnPriceInput','investmentTxnDateInput'].forEach(id=>$(id).addEventListener('input',syncInvestmentAutoCosts)); $('investmentCostManualInput').onchange=syncInvestmentCostManualState; $('updateInvestmentPriceBtn').onclick=()=>openInvestmentQuoteEditor(); $('refreshTodayInvestmentPriceBtn').onclick=openInvestmentMarketOverview; if($('toggleInvestmentVisibilityBtn'))$('toggleInvestmentVisibilityBtn').onclick=toggleInvestmentValuesVisible; $('investmentQuoteSymbolInput').addEventListener('blur',refreshInvestmentQuoteSymbolMeta); $('cancelInvestmentQuoteBtn').onclick=()=>hide($('investmentQuoteEditorScreen')); $('saveInvestmentQuoteBtn').onclick=saveInvestmentQuote; if($('closeInvestmentMarketOverviewBtn'))$('closeInvestmentMarketOverviewBtn').onclick=()=>hide($('investmentMarketOverviewScreen')); if($('refreshInvestmentMarketOverviewBtn'))$('refreshInvestmentMarketOverviewBtn').onclick=async()=>{await fetchIntradayQuotes();await renderInvestmentMarketOverview({force:true});};
    $('investmentAllocationCard').onclick=openInvestmentHoldingsOverview; $('investmentAllocationCard').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openInvestmentHoldingsOverview();}}; $('closeInvestmentHoldingsBtn').onclick=closeInvestmentHoldingsOverview; if($('investmentSyncNotice')){$('investmentSyncNotice').onclick=openInvestmentPendingList;$('investmentSyncNotice').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openInvestmentPendingList();}};} if($('closeInvestmentPendingBtn'))$('closeInvestmentPendingBtn').onclick=()=>hide($('investmentPendingScreen')); $('openInvestmentIncomeAnalysisBtn').onclick=openInvestmentIncomeAnalysis; $('investmentIncomeAnalysisShortcutBtn').onclick=openInvestmentIncomeAnalysis; $('closeInvestmentIncomeAnalysisBtn').onclick=closeInvestmentIncomeAnalysis; $('applyInvestmentIncomeRangeBtn').onclick=renderInvestmentIncomeRange; $('investmentIncomeStartMonth').onchange=renderInvestmentIncomeRange; $('investmentIncomeEndMonth').onchange=renderInvestmentIncomeRange; $('openInvestmentActivityBtn').onclick=openInvestmentActivity; $('closeInvestmentActivityBtn').onclick=closeInvestmentActivity; $('investmentActivityYearInput').onchange=renderInvestmentActivity; if($('openInvestmentReturnDetailBtn'))$('openInvestmentReturnDetailBtn').onclick=()=>openInvestmentReturnDetail(new Date().getFullYear()); if($('closeInvestmentReturnDetailBtn'))$('closeInvestmentReturnDetailBtn').onclick=closeInvestmentReturnDetail; if($('refreshInvestmentBoundaryPricesBtn'))$('refreshInvestmentBoundaryPricesBtn').onclick=refreshInvestmentBoundaryPrices; if($('openInvestmentRealizedBtn'))$('openInvestmentRealizedBtn').onclick=()=>openInvestmentRealizedDetail(new Date().getFullYear()); if($('closeInvestmentRealizedBtn'))$('closeInvestmentRealizedBtn').onclick=()=>hide($('investmentRealizedScreen')); if($('investmentRealizedYearInput'))$('investmentRealizedYearInput').onchange=e=>{investmentRealizedYear=Number(e.target.value);investmentRealizedSymbol='';renderInvestmentRealizedDetail();}; if($('investmentRealizedSymbolInput'))$('investmentRealizedSymbolInput').onchange=e=>{investmentRealizedSymbol=e.target.value;renderInvestmentRealizedDetail();}; if($('investmentRealizedOutcomeInput'))$('investmentRealizedOutcomeInput').onchange=e=>{investmentRealizedOutcome=e.target.value;renderInvestmentRealizedDetail();};
    $('addDividendEventBtn').onclick=()=>openDividendEventEditor(); if($('refreshDividendCalendarBtn'))$('refreshDividendCalendarBtn').onclick=()=>syncOfficialDividendCalendar({force:true,silent:false}); $('cancelDividendEventBtn').onclick=()=>hide($('dividendEventEditorScreen')); $('saveDividendEventBtn').onclick=saveDividendEvent; $('deleteDividendEventBtn').onclick=deleteDividendEvent; $('dividendSymbolInput').addEventListener('blur',refreshDividendSymbolMeta); ['dividendSymbolInput','dividendExDateInput','dividendPerShareInput'].forEach(id=>$(id).addEventListener('input',renderDividendEditorPreview));
    $('addAnnualSummaryBtn').onclick=()=>openAnnualSummaryEditor(); $('cancelAnnualSummaryBtn').onclick=()=>hide($('annualSummaryEditorScreen')); $('saveAnnualSummaryBtn').onclick=saveAnnualSummary; $('deleteAnnualSummaryBtn').onclick=deleteAnnualSummary;
    $('closeInvestmentDetailBtn').onclick=()=>hide($('investmentSecurityDetailScreen')); $('investmentDetailAddDividendBtn').onclick=()=>openDividendEventEditor(null,investmentDetailSymbol); $('investmentDetailManualQuoteBtn').onclick=()=>openInvestmentQuoteEditor(investmentDetailSymbol,cachedSecurityMeta(investmentDetailSymbol)?.name||''); document.querySelectorAll('[data-investment-detail-tab]').forEach(b=>b.onclick=()=>setInvestmentDetailTab(b.dataset.investmentDetailTab)); if($('investmentDetailRealizedCard'))$('investmentDetailRealizedCard').onclick=()=>setInvestmentDetailTab('realized');
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
