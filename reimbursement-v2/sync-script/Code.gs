const CONFIG = {
  SECRET: 'PASTE_YOUR_SYNC_KEY_HERE',
  VERSION: '1.0.0'
};

const SHEETS = {
  EVENTS: 'Events',
  BATCHES: 'Batches',
  META: 'Meta'
};

function doGet(e) {
  const p=(e&&e.parameter)||{};
  const callback=safeCallback_(p.callback||'callback');
  let result;
  try {
    if (p.key !== CONFIG.SECRET) throw new Error('unauthorized');
    if (p.mode === 'ping') {
      const ss=getDb_();
      ensureSchema_(ss);
      result={ok:true,service:'報帳助手專用資料同步',version:CONFIG.VERSION,spreadsheetId:ss.getId(),spreadsheetName:ss.getName()};
    } else if (p.mode === 'status') {
      const raw=CacheService.getScriptCache().get('sync_'+String(p.requestId||''));
      result=raw?JSON.parse(raw):{ok:false,pending:true};
    } else if (p.mode === 'syncPull') {
      const ss=getDb_();
      ensureSchema_(ss);
      result={ok:true,data:{schemaVersion:1,events:readRows_(ss.getSheetByName(SHEETS.EVENTS)),batches:readRows_(ss.getSheetByName(SHEETS.BATCHES)),serverTime:new Date().toISOString()}};
    } else {
      result={ok:true,message:'Reimbursement Sync Bridge is running.'};
    }
  } catch (err) {
    result={ok:false,error:String(err&&err.message?err.message:err)};
  }
  return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  const p=(e&&e.parameter)||{};
  const requestId=String(p.requestId||'');
  const cache=CacheService.getScriptCache();
  try {
    if (p.key !== CONFIG.SECRET) throw new Error('unauthorized');
    if (p.action !== 'syncData') throw new Error('unsupported action');
    const encoded=String(p.base64||'');
    if(!encoded) throw new Error('missing sync payload');
    if(encoded.length>8*1024*1024) throw new Error('sync payload too large');

    const json=Utilities.newBlob(Utilities.base64Decode(encoded)).getDataAsString('UTF-8');
    const payload=JSON.parse(json);
    if(Number(payload.schemaVersion||0)!==1) throw new Error('unsupported schema');

    const ss=getDb_();
    ensureSchema_(ss);
    const events=Array.isArray(payload.events)?payload.events:[];
    const batches=Array.isArray(payload.batches)?payload.batches:[];
    const eventResult=upsertRows_(ss.getSheetByName(SHEETS.EVENTS),events);
    const batchResult=upsertRows_(ss.getSheetByName(SHEETS.BATCHES),batches);
    writeMeta_(ss,'lastSyncAt',new Date().toISOString());

    const result={ok:true,requestId,events:eventResult,batches:batchResult,serverTime:new Date().toISOString()};
    if(requestId) cache.put('sync_'+requestId,JSON.stringify(result),600);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    const result={ok:false,requestId,error:String(err&&err.message?err.message:err)};
    if(requestId) cache.put('sync_'+requestId,JSON.stringify(result),600);
    return ContentService.createTextOutput('ERROR');
  }
}

function setup() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss) throw new Error('請從「報帳資料庫」Google Sheet 的「擴充功能 → Apps Script」執行 setup()');
  PropertiesService.getScriptProperties().setProperty('DB_SPREADSHEET_ID', ss.getId());
  ensureSchema_(ss);
  writeMeta_(ss,'createdAt',new Date().toISOString());
  SpreadsheetApp.getUi().alert('報帳資料庫已初始化完成，且已記住資料庫 ID。');
}

function getDb_() {
  const props=PropertiesService.getScriptProperties();
  const id=props.getProperty('DB_SPREADSHEET_ID');
  if(id) return SpreadsheetApp.openById(id);

  // 僅在從試算表／編輯器執行時有 active spreadsheet；
  // Web App 執行時 getActiveSpreadsheet() 不可用，因此一定要先跑 setup()。
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss) throw new Error('資料庫尚未綁定，請先從報帳資料庫執行一次 setup()');
  props.setProperty('DB_SPREADSHEET_ID', ss.getId());
  return ss;
}

function ensureSchema_(ss) {
  ensureDataSheet_(ss,SHEETS.EVENTS);
  ensureDataSheet_(ss,SHEETS.BATCHES);
  let meta=ss.getSheetByName(SHEETS.META);
  if(!meta) meta=ss.insertSheet(SHEETS.META);
  if(meta.getLastRow()===0) meta.getRange(1,1,1,2).setValues([['key','value']]);
}

function ensureDataSheet_(ss,name) {
  let sh=ss.getSheetByName(name);
  if(!sh) sh=ss.insertSheet(name);
  if(sh.getLastRow()===0) sh.getRange(1,1,1,4).setValues([['id','updatedAt','json','serverUpdatedAt']]);
  return sh;
}

function readRows_(sh) {
  const last=sh.getLastRow();
  if(last<2) return [];
  const values=sh.getRange(2,1,last-1,4).getValues();
  const out=[];
  for(const row of values) {
    if(!row[0]||!row[2]) continue;
    try { out.push(JSON.parse(row[2])); } catch (_) {}
  }
  return out;
}

function upsertRows_(sh,items) {
  const last=sh.getLastRow();
  const values=last>=2?sh.getRange(2,1,last-1,4).getValues():[];
  const index=new Map();
  values.forEach((row,i)=>{ if(row[0]) index.set(String(row[0]),{row:i+2,updatedAt:String(row[1]||'')}); });

  let inserted=0,updated=0,skipped=0;
  items.forEach(item=>{
    if(!item||!item.id) return;
    const id=String(item.id);
    const incoming=String(item.updatedAt||item.createdAt||'');
    const found=index.get(id);
    const serverNow=new Date().toISOString();
    const data=[id,incoming,JSON.stringify(item),serverNow];
    if(!found) {
      sh.appendRow(data);
      index.set(id,{row:sh.getLastRow(),updatedAt:incoming});
      inserted++;
    } else if(incoming>=found.updatedAt) {
      sh.getRange(found.row,1,1,4).setValues([data]);
      found.updatedAt=incoming;
      updated++;
    } else {
      skipped++;
    }
  });
  return {inserted,updated,skipped,total:items.length};
}

function writeMeta_(ss,key,value) {
  const sh=ss.getSheetByName(SHEETS.META);
  const last=sh.getLastRow();
  if(last>=2) {
    const keys=sh.getRange(2,1,last-1,1).getValues().flat();
    const idx=keys.findIndex(v=>String(v)===String(key));
    if(idx>=0) {
      sh.getRange(idx+2,2).setValue(value);
      return;
    }
  }
  sh.appendRow([key,value]);
}

function safeCallback_(name) {
  return /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(String(name))?String(name):'callback';
}
