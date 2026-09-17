import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const MASTER_FILE = path.join(DATA_DIR, 'security-master.json');
const QUOTES_FILE = path.join(DATA_DIR, 'latest-quotes.json');

const SOURCES = {
  TPEx: 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes',
  TPEx_INDEX: 'https://www.tpex.org.tw/openapi/v1/tpex_daily_trading_index',
  TWSE_REPORT: ({date}) => `https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date=${date}&type=ALLBUT0999&response=json`,
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
  if (s.includes('-') || s === '－') return -Math.abs(n);
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

// Kept for backwards compatibility with the existing parser test fixtures.
export function parseTWSE(rows) {
  const out = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const symbol = pick(r, ['Code','證券代號']).toUpperCase();
    const name = pick(r, ['Name','證券名稱']);
    if (!validSymbol(symbol) || !name) continue;
    const date = normalizeDate(pick(r, ['Date','日期']));
    const close = numeric(pick(r, ['ClosingPrice','收盤價']));
    const change = numeric(pick(r, ['Change','ChangePrice','漲跌價差','漲跌']));
    const changePct = numeric(pick(r, ['ChangePercent','ChangePct','漲跌幅','漲跌百分比']));
    out.push({
      symbol, name, market:'TWSE', securityType:securityType(symbol,name),
      date, close: close > 0 ? close : 0, change, changePct
    });
  }
  return out;
}

export function parseTPEx(rows) {
  const out = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const symbol = pick(r, ['SecuritiesCompanyCode','Code','證券代號']).toUpperCase();
    const name = pick(r, ['CompanyName','SecuritiesCompanyName','SecuritiesName','Name','證券名稱']);
    if (!validSymbol(symbol) || !name) continue;
    const date = normalizeDate(pick(r, ['Date','日期']));
    const close = numeric(pick(r, ['Close','收盤','收盤價']));
    const change = numeric(pick(r, ['Change','ChangePrice','漲跌價差','漲跌']));
    const changePct = numeric(pick(r, ['ChangePercent','ChangePct','漲跌幅','漲跌百分比']));
    out.push({
      symbol, name, market:'TPEx', securityType:securityType(symbol,name),
      date, close: close > 0 ? close : 0, change, changePct
    });
  }
  return out;
}

export function parseTWSEIndex(rows) {
  const out=[];
  for(const r of Array.isArray(rows)?rows:[]){
    const date=normalizeDate(pick(r,['Date','日期']));
    const value=numeric(pick(r,['TAIEX','Index','IndexValue','發行量加權股價指數','加權指數']));
    const change=numeric(pick(r,['Change','ChangePoint','漲跌點數','漲跌']));
    if(!date||!(value>0))continue;
    const previous=value-change;
    const changePct=previous>0?change/previous*100:0;
    out.push({code:'TAIEX',name:'加權指數',market:'TWSE',date,value,change,changePct});
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

export function parseTPExIndex(rows) {
  const out=[];
  for(const r of Array.isArray(rows)?rows:[]){
    const date=normalizeDate(pick(r,['Date','日期','TradeDate']));
    const value=numeric(pick(r,['Index','Close','ClosingIndex','IndexValue','TPExIndex','櫃買指數','指數']));
    const change=numeric(pick(r,['Change','ChangePoint','漲跌點數','漲跌']));
    if(!date||!(value>0))continue;
    const explicitPct=numeric(pick(r,['ChangePercent','ChangePct','漲跌幅','漲跌百分比']));
    const previous=value-change;
    const changePct=explicitPct|| (previous>0?change/previous*100:0);
    out.push({code:'OTC',name:'櫃買指數',market:'TPEx',date,value,change,changePct});
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

function findReportTable(report, requiredFields) {
  if (!report || typeof report !== 'object') return null;
  for (const [key, fields] of Object.entries(report)) {
    if (!/^fields\d+$/.test(key) || !Array.isArray(fields)) continue;
    const normalized = fields.map(x => String(x ?? '').trim());
    if (!requiredFields.every(field => normalized.includes(field))) continue;
    const suffix = key.slice('fields'.length);
    const rows = report[`data${suffix}`];
    if (Array.isArray(rows)) return {fields: normalized, rows};
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

  const out=[];
  for (const row of table.rows) {
    if (!Array.isArray(row)) continue;
    const symbol = String(valueAt(row, table.fields, ['證券代號']) ?? '').trim().toUpperCase();
    const name = String(valueAt(row, table.fields, ['證券名稱']) ?? '').trim();
    if (!validSymbol(symbol) || !name) continue;
    const close = numeric(valueAt(row, table.fields, ['收盤價']));
    const sign = valueAt(row, table.fields, ['漲跌(+/-)','漲跌']);
    const change = signedNumber(sign, valueAt(row, table.fields, ['漲跌價差']));
    if (!(close > 0)) continue;
    out.push({
      symbol,
      name,
      market:'TWSE',
      securityType:securityType(symbol,name),
      date,
      close,
      change,
      changePct:0,
    });
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
    const changePct = previous > 0 ? change / previous * 100 : 0;
    return [{code:'TAIEX', name:'加權指數', market:'TWSE', date, value, change, changePct}];
  }
  return [];
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}

async function fetchJson(url, timeoutMs=20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {
        'accept': 'application/json,text/plain,*/*',
        'user-agent': 'Mozilla/5.0 little-days-accounting-market-updater/1.5.6-hotfix'
      }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const text = await r.text();
    const trimmed = text.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      throw new Error(`Expected JSON but received ${trimmed.slice(0,80).replace(/\s+/g,' ')}`);
    }
    return JSON.parse(trimmed);
  } finally {
    clearTimeout(timer);
  }
}

function taipeiDateString(now=new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone:'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit'
  }).formatToParts(now);
  const map = Object.fromEntries(parts.map(p => [p.type,p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function compactDate(iso) { return String(iso).replace(/-/g,''); }

function minusDays(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0,10);
}

async function fetchLatestTWSEReport(now=new Date()) {
  const today = taipeiDateString(now);
  let lastError = null;
  for (let offset=0; offset<8; offset++) {
    const date = minusDays(today, offset);
    try {
      const report = await fetchJson(SOURCES.TWSE_REPORT({date:compactDate(date)}));
      const rows = parseTWSEReport(report);
      if (rows.length) return {report, rows, date:rows[0].date};
      lastError = new Error(`TWSE report ${date} returned no closing rows`);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('TWSE report unavailable');
}

function latestDate(items) {
  return items.map(x=>x?.date).filter(Boolean).sort().at(-1) || '';
}

function sortBySymbol(a,b){ return a.symbol.localeCompare(b.symbol, 'en'); }

export async function buildMarketData({twseRows=null,tpexRows=null, now=new Date()}={}) {
  await fs.mkdir(DATA_DIR, {recursive:true});
  const previousMaster = await readJson(MASTER_FILE, {items:[]});
  const previousQuotes = await readJson(QUOTES_FILE, {items:[]});

  const sourceStatus = {};
  let twse = [];
  let tpex = tpexRows;
  let twseReport = null;

  if (twseRows !== null) {
    twse = parseTWSE(twseRows);
    sourceStatus.TWSE = 'fixture';
  } else {
    try {
      const result = await fetchLatestTWSEReport(now);
      twseReport = result.report;
      twse = result.rows;
      sourceStatus.TWSE = 'ok: twse.com.tw MI_INDEX';
    } catch (e) {
      sourceStatus.TWSE = `error: ${e.message}`;
      throw new Error(`TWSE closing data unavailable: ${e.message}`);
    }
  }

  if (tpex === null) {
    try { tpex = await fetchJson(SOURCES.TPEx); sourceStatus.TPEx = 'ok'; }
    catch (e) {
      sourceStatus.TPEx = `error: ${e.message}`;
      throw new Error(`TPEx closing data unavailable: ${e.message}`);
    }
  } else sourceStatus.TPEx = 'fixture';

  const parsedTPEx = parseTPEx(tpex);
  if (!twse.length) throw new Error('TWSE returned no valid closing quotes.');
  if (!parsedTPEx.length) throw new Error('TPEx returned no valid closing quotes.');

  const twseTradeDate = latestDate(twse);
  const tpexTradeDate = latestDate(parsedTPEx);

  // Both Taiwan exchanges share the same trading calendar. A mismatch means
  // one source is stale, so do not publish a mixed-date portfolio snapshot.
  if (twseTradeDate !== tpexTradeDate) {
    throw new Error(`Market data freshness mismatch: TWSE=${twseTradeDate || 'none'}, TPEx=${tpexTradeDate || 'none'}`);
  }

  let tpexIndexRows=[];
  try { tpexIndexRows = await fetchJson(SOURCES.TPEx_INDEX); sourceStatus.TPEx_INDEX = 'ok'; }
  catch (e) { sourceStatus.TPEx_INDEX = `error: ${e.message}`; }

  const fresh = [...twse, ...parsedTPEx];
  if (!fresh.length && !previousMaster?.items?.length) {
    throw new Error('No market data returned and no previous static data exists.');
  }

  const masterMap = new Map();
  for (const item of Array.isArray(previousMaster?.items) ? previousMaster.items : []) {
    if (item?.symbol) masterMap.set(String(item.symbol).toUpperCase(), item);
  }
  const quoteMap = new Map();
  for (const item of Array.isArray(previousQuotes?.items) ? previousQuotes.items : []) {
    if (item?.symbol) quoteMap.set(String(item.symbol).toUpperCase(), item);
  }

  for (const item of fresh) {
    masterMap.set(item.symbol, {
      symbol:item.symbol,
      name:item.name,
      market:item.market,
      securityType:item.securityType
    });
    if (item.date && item.close > 0) {
      const old = quoteMap.get(item.symbol);
      if (!old?.date || item.date >= old.date) {
        let previousClose=Number(old?.previousClose||0)||0;
        if(old?.date && item.date>old.date && Number(old.close)>0) previousClose=Number(old.close);
        const explicitChange = Number(item.change);
        const hasExplicitChange = Number.isFinite(explicitChange);
        const change = hasExplicitChange ? explicitChange : (previousClose>0?item.close-previousClose:0);
        if(!previousClose && change) previousClose=item.close-change;
        const changePct=Number(item.changePct||0)||(previousClose>0?change/previousClose*100:0);
        quoteMap.set(item.symbol, {
          symbol:item.symbol,
          name:item.name,
          market:item.market,
          securityType:item.securityType,
          date:item.date,
          close:item.close,
          previousClose,change,changePct
        });
      }
    }
  }

  const generatedAt = now.toISOString();
  const master = {
    schemaVersion:1,
    generatedAt,
    sourceStatus,
    marketTradeDates:{TWSE:twseTradeDate,TPEx:tpexTradeDate},
    items:[...masterMap.values()].sort(sortBySymbol)
  };

  const indices=[];
  const twseIndices = twseReport ? parseTWSEReportIndex(twseReport) : [];
  const tpexIndices=parseTPExIndex(tpexIndexRows);
  if(twseIndices.length)indices.push(twseIndices.at(-1));
  if(tpexIndices.length)indices.push(tpexIndices.at(-1));

  const quotes = {
    schemaVersion:1,
    generatedAt,
    sourceStatus,
    latestTradeDate:twseTradeDate,
    marketTradeDates:{TWSE:twseTradeDate,TPEx:tpexTradeDate},
    indices,
    items:[...quoteMap.values()].sort(sortBySymbol)
  };

  await fs.writeFile(MASTER_FILE, JSON.stringify(master,null,2)+'\n', 'utf8');
  await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes,null,2)+'\n', 'utf8');
  return {
    masterCount:master.items.length,
    quoteCount:quotes.items.length,
    indexCount:indices.length,
    latestTradeDate:quotes.latestTradeDate,
    marketTradeDates:quotes.marketTradeDates,
    sourceStatus
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  buildMarketData()
    .then(r => console.log(JSON.stringify(r,null,2)))
    .catch(e => { console.error(e); process.exitCode = 1; });
}
