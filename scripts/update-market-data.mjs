import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const MASTER_FILE = path.join(DATA_DIR, 'security-master.json');
const QUOTES_FILE = path.join(DATA_DIR, 'latest-quotes.json');

const SOURCES = {
  TWSE_REPORT: ({date}) => `https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date=${date}&type=ALLBUT0999&response=json`,
  TPEx_QUOTES: 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes',
  TPEx_DAILY_CLOSE: 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes',
  TPEx_INDEX: 'https://www.tpex.org.tw/openapi/v1/tpex_daily_trading_index',
  HOLIDAY_SCHEDULE: 'https://www.twse.com.tw/rwd/zh/holidaySchedule/holidaySchedule?response=json',
};

const DEFAULT_HEADERS = {
  accept: 'application/json,text/plain,*/*',
  'accept-language': 'zh-TW,zh;q=0.9,en;q=0.7',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
  'user-agent': 'Mozilla/5.0 (compatible; LittleDaysMarketUpdater/1.5.6-v4; +https://github.com/)',
};

function pick(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

export function normalizeDate(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    const y = Number(digits.slice(0, 4));
    if (y >= 1911) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
  }
  if (digits.length === 7) {
    const y = Number(digits.slice(0, 3)) + 1911;
    return `${y}-${digits.slice(3,5)}-${digits.slice(5,7)}`;
  }
  const parts = raw.split(/[\/-]/).map(x => x.trim()).filter(Boolean);
  if (parts.length === 3) {
    let y = Number(parts[0]);
    if (y < 1911) y += 1911;
    if (Number.isFinite(y)) return `${String(y).padStart(4,'0')}-${String(parts[1]).padStart(2,'0')}-${String(parts[2]).padStart(2,'0')}`;
  }
  return '';
}

function numeric(value) {
  const text = String(value ?? '').replace(/,/g, '').trim();
  if (!text || text === '--' || text === '---' || text === '除權' || text === '除息') return 0;
  const n = Number(text);
  return Number.isFinite(n) ? n : 0;
}

function signedNumber(sign, value) {
  const n = numeric(value);
  const s = String(sign ?? '').trim();
  if (s.includes('-') || s.includes('－')) return -Math.abs(n);
  return n;
}

export function securityType(symbol, name='') {
  const s = String(symbol || '').toUpperCase();
  const text = String(name || '');
  if (/債.*ETF|ETF.*債|投等債|公司債|公債|債券/i.test(text)) return 'bond-etf';
  if (/ETF|基金/i.test(text) || /^00/.test(s)) return 'etf';
  return 'stock';
}

function validSymbol(symbol) {
  return /^[0-9A-Z]{4,8}$/.test(symbol);
}

function marketKey(value) {
  return String(value || '').toUpperCase() === 'TPEX' ? 'TPEx' : 'TWSE';
}

export function parseTPEx(rows) {
  const out = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const symbol = pick(r, ['SecuritiesCompanyCode','Code','證券代號']).toUpperCase();
    const name = pick(r, ['CompanyName','SecuritiesCompanyName','SecuritiesName','Name','證券名稱']);
    if (!validSymbol(symbol) || !name) continue;
    const date = normalizeDate(pick(r, ['Date','日期','TradeDate']));
    const close = numeric(pick(r, ['Close','收盤','收盤價']));
    if (!date || !(close > 0)) continue; // Never publish a quote without its own official date.
    const change = numeric(pick(r, ['Change','ChangePrice','漲跌價差','漲跌']));
    const changePct = numeric(pick(r, ['ChangePercent','ChangePct','漲跌幅','漲跌百分比']));
    out.push({symbol,name,market:'TPEx',securityType:securityType(symbol,name),date,close,change,changePct});
  }
  return out;
}

function findReportTable(report, requiredFields) {
  if (!report || typeof report !== 'object') return null;
  for (const table of Array.isArray(report.tables) ? report.tables : []) {
    const fields = Array.isArray(table?.fields) ? table.fields.map(x => String(x ?? '').trim()) : [];
    if (!requiredFields.every(field => fields.includes(field))) continue;
    if (Array.isArray(table?.data)) return {fields, rows:table.data};
  }
  for (const [key, fieldsRaw] of Object.entries(report)) {
    if (!/^fields\d+$/.test(key) || !Array.isArray(fieldsRaw)) continue;
    const fields = fieldsRaw.map(x => String(x ?? '').trim());
    if (!requiredFields.every(field => fields.includes(field))) continue;
    const rows = report[`data${key.slice('fields'.length)}`];
    if (Array.isArray(rows)) return {fields, rows};
  }
  return null;
}

function valueAt(row, fields, names) {
  for (const name of names) {
    const idx = fields.indexOf(name);
    if (idx >= 0) return row?.[idx];
  }
  return '';
}

export function parseTWSEReport(report) {
  const date = normalizeDate(report?.date);
  const table = findReportTable(report, ['證券代號','證券名稱','收盤價']);
  if (!date || !table) return [];
  const out = [];
  for (const row of table.rows) {
    if (!Array.isArray(row)) continue;
    const symbol = String(valueAt(row, table.fields, ['證券代號']) ?? '').trim().toUpperCase();
    const name = String(valueAt(row, table.fields, ['證券名稱']) ?? '').trim();
    const close = numeric(valueAt(row, table.fields, ['收盤價']));
    if (!validSymbol(symbol) || !name || !(close > 0)) continue;
    const sign = valueAt(row, table.fields, ['漲跌(+/-)','漲跌']);
    const change = signedNumber(sign, valueAt(row, table.fields, ['漲跌價差']));
    out.push({symbol,name,market:'TWSE',securityType:securityType(symbol,name),date,close,change,changePct:0});
  }
  return out;
}

export function parseTWSEReportIndex(report) {
  const date = normalizeDate(report?.date);
  if (!date) return [];
  const table = findReportTable(report, ['指數']);
  if (!table) return [];
  for (const row of table.rows) {
    if (!Array.isArray(row)) continue;
    const name = String(valueAt(row, table.fields, ['指數']) ?? '').trim();
    if (!/發行量加權股價指數|加權股價指數/.test(name)) continue;
    const value = numeric(valueAt(row, table.fields, ['收盤指數','收盤價','指數']));
    const sign = valueAt(row, table.fields, ['漲跌(+/-)','漲跌']);
    const change = signedNumber(sign, valueAt(row, table.fields, ['漲跌點數','漲跌價差']));
    if (!(value > 0)) continue;
    const previous = value - change;
    return [{code:'TAIEX',name:'加權指數',market:'TWSE',date,value,change,changePct:previous>0?change/previous*100:0}];
  }
  return [];
}

export function parseTPExIndex(rows) {
  const out = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const date = normalizeDate(pick(r,['Date','日期','TradeDate']));
    const value = numeric(pick(r,['TPExIndex','Index','Close','ClosingIndex','IndexValue','櫃買指數','指數']));
    const change = numeric(pick(r,['Change','ChangePoint','漲跌點數','漲跌']));
    if (!date || !(value > 0)) continue;
    const explicitPct = numeric(pick(r,['ChangePercent','ChangePct','漲跌幅','漲跌百分比']));
    const previous = value - change;
    out.push({code:'OTC',name:'櫃買指數',market:'TPEx',date,value,change,changePct:explicitPct || (previous>0?change/previous*100:0)});
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}

function sleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }

export async function fetchJsonWithRetry(url, {timeoutMs=20000, attempts=3, headers={}}={}) {
  let lastError = null;
  for (let attempt=1; attempt<=attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {signal:controller.signal, headers:{...DEFAULT_HEADERS,...headers}});
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const text = await response.text();
      const trimmed = text.trim();
      const contentType = response.headers.get('content-type') || '';
      if (trimmed.startsWith('<') || /text\/html/i.test(contentType)) throw new Error('received HTML instead of JSON');
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) throw new Error(`unexpected response prefix: ${trimmed.slice(0,80).replace(/\s+/g,' ')}`);
      return JSON.parse(trimmed);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000 * (2 ** (attempt - 1)) + Math.floor(Math.random()*500));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`failed after ${attempts} attempts: ${lastError?.message || 'unknown error'}`);
}

function taipeiDateString(now=new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const map = Object.fromEntries(parts.map(p => [p.type,p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}
function compactDate(iso){ return String(iso).replace(/-/g,''); }
function minusDays(iso, days){ const d=new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate()-days); return d.toISOString().slice(0,10); }
function latestDate(items){ return (items||[]).map(x=>x?.date).filter(Boolean).sort().at(-1)||''; }
function sortBySymbol(a,b){ return String(a.symbol).localeCompare(String(b.symbol),'en'); }

export function parseHolidaySchedule(payload) {
  const closed = new Set();
  for (const row of Array.isArray(payload?.data) ? payload.data : []) {
    if (!Array.isArray(row)) continue;
    const date = normalizeDate(row[0]);
    const name = String(row[1] ?? '').trim();
    if (!date) continue;
    if (!name.includes('交易日')) closed.add(date);
  }
  return closed;
}

function weekdayOf(iso) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function expectedTradeDateFromClosures(today, closedDates=new Set()) {
  let cursor = today;
  for (let i=0; i<20; i++) {
    const dow = weekdayOf(cursor);
    if (dow !== 0 && dow !== 6 && !closedDates.has(cursor)) return cursor;
    cursor = minusDays(cursor, 1);
  }
  return '';
}

async function fetchExpectedTradeDate(now=new Date()) {
  const today = taipeiDateString(now);
  try {
    const schedule = await fetchJsonWithRetry(SOURCES.HOLIDAY_SCHEDULE, {
      attempts:2, timeoutMs:12000, headers:{referer:'https://www.twse.com.tw/'}
    });
    const closed = parseHolidaySchedule(schedule);
    return {date:expectedTradeDateFromClosures(today, closed), verified:true, source:'TWSE holiday schedule'};
  } catch (error) {
    return {date:expectedTradeDateFromClosures(today, new Set()), verified:false, source:`weekday fallback: ${error.message}`};
  }
}

async function fetchLatestTWSE(now=new Date()) {
  const today = taipeiDateString(now);
  const errors = [];
  for (let offset=0; offset<8; offset++) {
    const requestedDate = minusDays(today, offset);
    try {
      const report = await fetchJsonWithRetry(SOURCES.TWSE_REPORT({date:compactDate(requestedDate)}), {
        attempts:2,
        headers:{referer:'https://www.twse.com.tw/'}
      });
      const rows = parseTWSEReport(report);
      if (rows.length) {
        const reportDate = rows[0].date;
        if (reportDate !== requestedDate) {
          errors.push(`${requestedDate}: response date mismatch ${reportDate}`);
          continue;
        }
        return {ok:true,market:'TWSE',rows,tradeDate:reportDate,index:parseTWSEReportIndex(report).at(-1)||null,source:'twse.com.tw MI_INDEX'};
      }
      errors.push(`${requestedDate}: ${String(report?.stat || 'no closing rows')}`);
    } catch (e) { errors.push(`${requestedDate}: ${e.message}`); }
  }
  return {ok:false,market:'TWSE',rows:[],tradeDate:'',index:null,source:'twse.com.tw MI_INDEX',error:errors.slice(-3).join(' | ')};
}

async function fetchLatestTPEx() {
  const errors = [];
  for (const [label,url] of [['mainboard_quotes',SOURCES.TPEx_QUOTES],['daily_close',SOURCES.TPEx_DAILY_CLOSE]]) {
    try {
      const raw = await fetchJsonWithRetry(url,{attempts:3,headers:{referer:'https://www.tpex.org.tw/'}});
      const parsed = parseTPEx(raw);
      const tradeDate = latestDate(parsed);
      if (!parsed.length || !tradeDate) { errors.push(`${label}: no valid dated closing quotes`); continue; }
      const rows = parsed.filter(x=>x.date===tradeDate);
      let index = null;
      try {
        const idxRaw = await fetchJsonWithRetry(SOURCES.TPEx_INDEX,{attempts:2,headers:{referer:'https://www.tpex.org.tw/'}});
        const indices = parseTPExIndex(idxRaw).filter(x=>x.date<=tradeDate);
        index = indices.at(-1)||null;
      } catch (e) { errors.push(`index: ${e.message}`); }
      return {ok:true,market:'TPEx',rows,tradeDate,index,source:`tpex.org.tw ${label}`,warning:errors.join(' | ')};
    } catch (e) { errors.push(`${label}: ${e.message}`); }
  }
  return {ok:false,market:'TPEx',rows:[],tradeDate:'',index:null,source:'tpex.org.tw OpenAPI',error:errors.join(' | ')};
}

function clone(value){ return JSON.parse(JSON.stringify(value)); }

export function mergeMarketSnapshots(previousMaster, previousQuotes, results, now=new Date(), expectedTradeDate='') {
  const oldMaster = previousMaster && typeof previousMaster==='object' ? clone(previousMaster) : {items:[]};
  const oldQuotes = previousQuotes && typeof previousQuotes==='object' ? clone(previousQuotes) : {items:[],indices:[]};
  const masterMap = new Map((Array.isArray(oldMaster.items)?oldMaster.items:[]).filter(x=>x?.symbol).map(x=>[String(x.symbol).toUpperCase(),x]));
  const quoteMap = new Map((Array.isArray(oldQuotes.items)?oldQuotes.items:[]).filter(x=>x?.symbol).map(x=>[String(x.symbol).toUpperCase(),x]));
  const indexMap = new Map((Array.isArray(oldQuotes.indices)?oldQuotes.indices:[]).filter(x=>x?.market).map(x=>[marketKey(x.market),x]));

  const sourceStatus = {};
  const marketTradeDates = {};
  const marketFreshness = {};
  const resultByMarket = new Map((results||[]).map(r=>[marketKey(r.market),r]));

  for (const market of ['TWSE','TPEx']) {
    const result = resultByMarket.get(market);
    const existingForMarket = [...quoteMap.values()].filter(x=>marketKey(x.market)===market);
    const previousMarketDate = latestDate(existingForMarket);

    if (!result?.ok) {
      sourceStatus[market] = `stale: ${result?.error || 'source unavailable'}`;
      marketTradeDates[market] = previousMarketDate;
      marketFreshness[market] = 'stale';
      for (const old of existingForMarket) quoteMap.set(String(old.symbol).toUpperCase(), {...old,isStale:true});
      const oldIndex=indexMap.get(market); if(oldIndex) indexMap.set(market,{...oldIndex,isStale:true});
      continue;
    }

    const sourceDate = String(result.tradeDate||'');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sourceDate)) {
      sourceStatus[market] = 'stale: source returned no valid trade date';
      marketTradeDates[market] = previousMarketDate;
      marketFreshness[market] = 'stale';
      for (const old of existingForMarket) quoteMap.set(String(old.symbol).toUpperCase(), {...old,isStale:true});
      continue;
    }

    if (previousMarketDate && sourceDate < previousMarketDate) {
      sourceStatus[market] = `stale: source regressed ${sourceDate} < stored ${previousMarketDate}`;
      marketTradeDates[market] = previousMarketDate;
      marketFreshness[market] = 'stale';
      for (const old of existingForMarket) quoteMap.set(String(old.symbol).toUpperCase(), {...old,isStale:true});
      continue;
    }

    if (expectedTradeDate && sourceDate > expectedTradeDate) {
      sourceStatus[market] = `stale: source returned future date ${sourceDate} > expected ${expectedTradeDate}`;
      marketTradeDates[market] = previousMarketDate;
      marketFreshness[market] = 'stale';
      for (const old of existingForMarket) quoteMap.set(String(old.symbol).toUpperCase(), {...old,isStale:true});
      continue;
    }

    const sourceIsCurrent = !expectedTradeDate || sourceDate === expectedTradeDate;
    sourceStatus[market] = `${sourceIsCurrent?'ok':'stale'}: ${result.source}${sourceIsCurrent?'':` ${sourceDate} < expected ${expectedTradeDate}`}${result.warning?` (${result.warning})`:''}`;
    marketTradeDates[market] = sourceDate;
    marketFreshness[market] = sourceIsCurrent ? 'fresh' : 'stale';

    // Existing symbols in this market become stale unless the new official snapshot refreshes them.
    for (const old of existingForMarket) quoteMap.set(String(old.symbol).toUpperCase(), {...old,isStale:true});

    for (const item of Array.isArray(result.rows)?result.rows:[]) {
      const symbol=String(item?.symbol||'').toUpperCase();
      if(!validSymbol(symbol)||item.date!==sourceDate||!(Number(item.close)>0)) continue;
      const old=quoteMap.get(symbol);
      if(old?.date && item.date < old.date) continue;
      const previousClose = old?.date && item.date>old.date && Number(old.close)>0 ? Number(old.close) : Number(old?.previousClose||0)||0;
      const explicitChange = Number(item.change);
      const change = Number.isFinite(explicitChange) && explicitChange!==0 ? explicitChange : (previousClose>0?Number(item.close)-previousClose:0);
      const derivedPrevious = previousClose || (change ? Number(item.close)-change : 0);
      const explicitPct = Number(item.changePct);
      const changePct = Number.isFinite(explicitPct) && explicitPct!==0 ? explicitPct : (derivedPrevious>0?change/derivedPrevious*100:0);
      quoteMap.set(symbol,{
        symbol,
        name:item.name||old?.name||'',
        market,
        securityType:item.securityType||old?.securityType||securityType(symbol,item.name||old?.name||''),
        date:item.date,
        close:Number(item.close),
        previousClose:derivedPrevious,
        change,
        changePct,
        isStale:marketFreshness[market]!=='fresh',
      });
      const oldMasterItem=masterMap.get(symbol)||{};
      masterMap.set(symbol,{...oldMasterItem,symbol,name:item.name||oldMasterItem.name||'',market,securityType:item.securityType||oldMasterItem.securityType||securityType(symbol,item.name||'')});
    }

    if(result.index?.date && result.index.date<=sourceDate) indexMap.set(market,{...result.index,isStale:result.index.date!==sourceDate});
    else { const oldIndex=indexMap.get(market); if(oldIndex) indexMap.set(market,{...oldIndex,isStale:true}); }
  }

  const activeMarketDates = ['TWSE','TPEx'].map(m=>marketTradeDates[m]).filter(Boolean).sort();
  const latestTradeDate = activeMarketDates.length ? activeMarketDates[0] : '';
  const quality = ['TWSE','TPEx'].every(m=>marketFreshness[m]==='fresh') ? 'ok' : ([...quoteMap.values()].length ? 'partial' : 'failed');
  const generatedAt=now.toISOString();

  return {
    master:{schemaVersion:1,generatedAt,sourceStatus,marketTradeDates,marketFreshness,items:[...masterMap.values()].sort(sortBySymbol)},
    quotes:{schemaVersion:1,generatedAt,quality,expectedTradeDate,sourceStatus,marketTradeDates,marketFreshness,latestTradeDate,indices:[...indexMap.values()].sort((a,b)=>String(a.market).localeCompare(String(b.market))),items:[...quoteMap.values()].sort(sortBySymbol)},
    summary:{quality,expectedTradeDate,latestTradeDate,marketTradeDates,marketFreshness,sourceStatus,masterCount:masterMap.size,quoteCount:quoteMap.size,indexCount:indexMap.size}
  };
}

export async function buildMarketData({now=new Date(),twseResult=null,tpexResult=null}={}) {
  await fs.mkdir(DATA_DIR,{recursive:true});
  const previousMaster=await readJson(MASTER_FILE,{schemaVersion:1,items:[]});
  const previousQuotes=await readJson(QUOTES_FILE,{schemaVersion:1,items:[],indices:[]});
  const [calendar,twse,tpex]=await Promise.all([fetchExpectedTradeDate(now),twseResult?Promise.resolve(twseResult):fetchLatestTWSE(now),tpexResult?Promise.resolve(tpexResult):fetchLatestTPEx()]);
  const merged=mergeMarketSnapshots(previousMaster,previousQuotes,[twse,tpex],now,calendar.date);
  merged.summary.calendarStatus = `${calendar.verified?'verified':'fallback'}: ${calendar.source}`;
  merged.quotes.calendarStatus = merged.summary.calendarStatus;
  merged.master.calendarStatus = merged.summary.calendarStatus;
  await fs.writeFile(MASTER_FILE,JSON.stringify(merged.master,null,2)+'\n','utf8');
  await fs.writeFile(QUOTES_FILE,JSON.stringify(merged.quotes,null,2)+'\n','utf8');
  return merged.summary;
}

const isMain=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isMain){
  buildMarketData().then(summary=>{
    console.log(JSON.stringify(summary,null,2));
    if(summary.quality!=='ok') process.exitCode=2;
  }).catch(error=>{console.error(error);process.exitCode=1;});
}
