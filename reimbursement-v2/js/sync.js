import { db } from './db.js';
import { isDeleted, mergeRows } from './records.js';

const URL_KEY = 'reimbursement_sync_script_url';
const DEFAULT_SYNC_URL = 'https://script.google.com/macros/s/AKfycbyUoh-_rQ1mgzBBJyH9SlmQ75f8GrShyLcFh9296ptX08DSHwO3Tg_ZmxxmI623akNu/exec';
const KEY_KEY = 'reimbursement_sync_script_key';

export function getSyncUrl(){ return localStorage.getItem(URL_KEY) || DEFAULT_SYNC_URL; }
export function setSyncUrl(v){ v=String(v||'').trim(); if(v) localStorage.setItem(URL_KEY,v); else localStorage.removeItem(URL_KEY); }
export function getSyncKey(){ return localStorage.getItem(KEY_KEY) || ''; }
export function setSyncKey(v){ v=String(v||'').trim(); if(v) localStorage.setItem(KEY_KEY,v); else localStorage.removeItem(KEY_KEY); }
export function hasSyncConfig(){ return !!(getSyncUrl() && getSyncKey()); }

function jsonp(url, timeout=12000){
  return new Promise((resolve,reject)=>{
    const cb='__sync_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const s=document.createElement('script');
    const timer=setTimeout(()=>{ cleanup(); reject(new Error('雲端同步回應逾時')); },timeout);
    function cleanup(){ clearTimeout(timer); delete window[cb]; s.remove(); }
    window[cb]=data=>{ cleanup(); resolve(data); };
    s.onerror=()=>{ cleanup(); reject(new Error('無法連線報帳資料庫')); };
    const sep=url.includes('?')?'&':'?';
    s.src=url+sep+'callback='+encodeURIComponent(cb);
    document.head.appendChild(s);
  });
}

function jsonToBase64(value){
  const bytes=new TextEncoder().encode(JSON.stringify(value));
  let binary='';
  const size=0x8000;
  for(let i=0;i<bytes.length;i+=size) binary+=String.fromCharCode(...bytes.subarray(i,i+size));
  return btoa(binary);
}

async function pollStatus(requestId){
  const url=getSyncUrl(), key=getSyncKey();
  const sep=url.includes('?')?'&':'?';
  for(let i=0;i<18;i++){
    await new Promise(r=>setTimeout(r,i===0?500:650));
    const r=await jsonp(url+sep+'mode=status&key='+encodeURIComponent(key)+'&requestId='+encodeURIComponent(requestId));
    if(r?.ok) return r;
    if(r && !r.pending) throw new Error(r.error||'雲端同步失敗');
  }
  throw new Error('雲端同步確認逾時');
}

export async function testSyncBridge(){
  const url=getSyncUrl(), key=getSyncKey();
  if(!url) throw new Error('尚未設定資料同步 Web App URL');
  if(!key) throw new Error('尚未設定 Sync Key');
  const sep=url.includes('?')?'&':'?';
  const r=await jsonp(url+sep+'mode=ping&key='+encodeURIComponent(key));
  if(!r?.ok) throw new Error('Sync Key 不正確，或 Apps Script 尚未部署');
  return r;
}

export async function pullCloudData(){
  const url=getSyncUrl(), key=getSyncKey();
  if(!url || !key) return {events:[],batches:[]};
  const sep=url.includes('?')?'&':'?';
  const r=await jsonp(url+sep+'mode=syncPull&key='+encodeURIComponent(key),20000);
  if(!r?.ok) throw new Error(r?.error||'讀取雲端資料失敗');
  return r.data || {events:[],batches:[]};
}

export async function pushCloudData(payload){
  const url=getSyncUrl(), key=getSyncKey();
  if(!url || !key) throw new Error('尚未設定雲端同步');
  const requestId=crypto.randomUUID?crypto.randomUUID():Date.now()+'_'+Math.random().toString(36).slice(2);
  const body=new URLSearchParams();
  body.set('action','syncData');
  body.set('key',key);
  body.set('requestId',requestId);
  body.set('base64',jsonToBase64(payload));
  await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
  return pollStatus(requestId);
}

let syncQueue = Promise.resolve();

export function syncNow(onStatus=()=>{}){
  const run = syncQueue.catch(()=>{}).then(()=>performSync(onStatus));
  syncQueue = run;
  return run;
}

async function performSync(onStatus){
  if(!hasSyncConfig()) return {configured:false};
  onStatus('正在讀取雲端資料…');
  const cloud=await pullCloudData();
  const isDemo=e=>e?.name==='示範：工作會議';
  const cloudEvents=(cloud.events||[]).filter(e=>!isDemo(e));
  onStatus('正在合併手機／電腦資料…');
  // 在同一個 IndexedDB transaction 讀取最新本機資料並合併，保留讀雲端期間的刪除／還原。
  const events=await db.merge('events',cloudEvents,mergeRows);
  const batches=await db.merge('batches',cloud.batches||[],mergeRows);

  window.dispatchEvent(new Event('reimbursement-data-changed'));
  onStatus('正在寫回專用 Google Sheet…');
  await pushCloudData({schemaVersion:1,events,batches,clientTime:new Date().toISOString()});
  onStatus('同步完成');
  return {configured:true,events:events.filter(e=>!isDeleted(e)).length,batches:batches.length};
}

export async function syncQuietly(){
  if(!hasSyncConfig()) return;
  try{ await syncNow(); }catch(err){ console.warn('background sync failed',err); }
}
