import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const MASTER_FILE = path.join(DATA_DIR, 'security-master.json');
const QUOTES_FILE = path.join(DATA_DIR, 'latest-quotes.json');

const SOURCES = {
  TWSE: 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL',
  TPEx: 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes',
  TWSE_INDEX: 'https://openapi.twse.com.tw/v1/exchangeReport/FMTQIK',
  TPEx_INDEX: 'https://www.tpex.org.tw/openapi/v1/tpex_daily_trading_index',
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
  const n = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
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
        'user-agent': 'little-days-accounting-market-updater/1.5.0'
      }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

function sortBySymbol(a,b){ return a.symbol.localeCompare(b.symbol, 'en'); }

export async function buildMarketData({twseRows=null,tpexRows=null, now=new Date()}={}) {
  await fs.mkdir(DATA_DIR, {recursive:true});
  const previousMaster = await readJson(MASTER_FILE, {items:[]});
  const previousQuotes = await readJson(QUOTES_FILE, {items:[]});

  const sourceStatus = {};
  let twse = twseRows;
  let tpex = tpexRows;

  if (twse === null) {
    try { twse = await fetchJson(SOURCES.TWSE); sourceStatus.TWSE = 'ok'; }
    catch (e) { twse = []; sourceStatus.TWSE = `error: ${e.message}`; }
  } else sourceStatus.TWSE = 'fixture';

  if (tpex === null) {
    try { tpex = await fetchJson(SOURCES.TPEx); sourceStatus.TPEx = 'ok'; }
    catch (e) { tpex = []; sourceStatus.TPEx = `error: ${e.message}`; }
  } else sourceStatus.TPEx = 'fixture';

  let twseIndexRows=[],tpexIndexRows=[];
  try { twseIndexRows = await fetchJson(SOURCES.TWSE_INDEX); sourceStatus.TWSE_INDEX = 'ok'; }
  catch (e) { sourceStatus.TWSE_INDEX = `error: ${e.message}`; }
  try { tpexIndexRows = await fetchJson(SOURCES.TPEx_INDEX); sourceStatus.TPEx_INDEX = 'ok'; }
  catch (e) { sourceStatus.TPEx_INDEX = `error: ${e.message}`; }

  const fresh = [...parseTWSE(twse), ...parseTPEx(tpex)];
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
        const change=Number(item.change||0)||(previousClose>0?item.close-previousClose:0);
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
    items:[...masterMap.values()].sort(sortBySymbol)
  };
  const indices=[];
  const twseIndices=parseTWSEIndex(twseIndexRows),tpexIndices=parseTPExIndex(tpexIndexRows);
  if(twseIndices.length)indices.push(twseIndices.at(-1));
  if(tpexIndices.length)indices.push(tpexIndices.at(-1));
  const quotes = {
    schemaVersion:1,
    generatedAt,
    sourceStatus,
    latestTradeDate:[...quoteMap.values()].map(x=>x.date).filter(Boolean).sort().at(-1)||'',
    indices,
    items:[...quoteMap.values()].sort(sortBySymbol)
  };

  await fs.writeFile(MASTER_FILE, JSON.stringify(master,null,2)+'\n', 'utf8');
  await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes,null,2)+'\n', 'utf8');
  return {masterCount:master.items.length,quoteCount:quotes.items.length,indexCount:indices.length,latestTradeDate:quotes.latestTradeDate,sourceStatus};
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  buildMarketData()
    .then(r => console.log(JSON.stringify(r,null,2)))
    .catch(e => { console.error(e); process.exitCode = 1; });
}
