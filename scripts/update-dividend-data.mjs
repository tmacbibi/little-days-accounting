import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TWSE_ETF_DIVIDEND_URL = 'https://www.twse.com.tw/zh/ETFortune/dividendList';
export const TWSE_STOCK_EXDIV_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUTPUT = path.join(ROOT, 'data', 'dividend-calendar.json');

export function normalizeDate(value) {
  const s = String(value ?? '').trim().replace(/\s+/g, '');
  if (!s) return '';
  let m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})(?:日)?$/);
  if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m = s.match(/^(\d{2,3})[-/.年](\d{1,2})[-/.月](\d{1,2})(?:日)?$/);
  if (m) return `${Number(m[1])+1911}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  if (/^\d{8}$/.test(s)) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
  if (/^\d{7}$/.test(s)) return `${Number(s.slice(0,3))+1911}-${s.slice(3,5)}-${s.slice(5,7)}`;
  return '';
}
function decodeHtml(s){return String(s??'').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');}
function cleanCell(html){return decodeHtml(String(html??'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();}
function numOrNull(value){const s=String(value??'').replace(/,/g,'').trim();if(!s||!(/^-?\d+(?:\.\d+)?$/).test(s))return null;const n=Number(s);return Number.isFinite(n)?n:null;}

export function parseTwseEtfDividendHtml(html) {
  const out=[];
  const trs=String(html??'').match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[];
  for(const tr of trs){
    const tds=[...tr.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>cleanCell(m[1]));
    if(tds.length<5)continue;
    const symbol=String(tds[0]||'').toUpperCase().replace(/\s+/g,'');
    if(!/^\d{4,6}[A-Z]?$/.test(symbol))continue;
    const exDate=normalizeDate(tds[2]),recordDate=normalizeDate(tds[3]),expectedPayDate=normalizeDate(tds[4]);
    if(!exDate)continue;
    out.push({symbol,name:tds[1]||symbol,market:'TWSE',securityType:'etf',exDate,recordDate,expectedPayDate,perShare:numOrNull(tds[5]),source:'TWSE_ETFORTUNE',sourceUrl:TWSE_ETF_DIVIDEND_URL});
  }
  return out;
}

export function parseTwseStockExdiv(rows){
  const out=[];
  for(const r of Array.isArray(rows)?rows:[]){
    const symbol=String(r?.Code||'').trim().toUpperCase(),exDate=normalizeDate(r?.Date),flag=String(r?.Exdividend||'');
    const perShare=numOrNull(r?.CashDividend);
    if(!symbol||!exDate||!flag.includes('息')||!(perShare>0))continue;
    out.push({symbol,name:String(r?.Name||symbol).trim(),market:'TWSE',securityType:'stock',exDate,recordDate:'',expectedPayDate:'',perShare,source:'TWSE_OPENAPI_TWT48U_ALL',sourceUrl:TWSE_STOCK_EXDIV_URL});
  }
  return out;
}

export function mergeDividendRows(rows){
  const map=new Map();
  for(const row of rows||[]){if(!row?.symbol||!row?.exDate)continue;const key=`${row.symbol}|${row.exDate}`,prev=map.get(key)||{};map.set(key,{...prev,...row,expectedPayDate:row.expectedPayDate||prev.expectedPayDate||'',recordDate:row.recordDate||prev.recordDate||'',perShare:row.perShare??prev.perShare??null});}
  return [...map.values()].sort((a,b)=>(a.exDate||'').localeCompare(b.exDate||'')||(a.symbol||'').localeCompare(b.symbol||''));
}

async function fetchText(url,fetchImpl=fetch){const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),20000);try{const r=await fetchImpl(url,{signal:ac.signal,headers:{accept:'text/html,application/xhtml+xml','user-agent':'little-days-dividend-bot/1.5.5'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.text();}finally{clearTimeout(timer);}}
async function fetchJson(url,fetchImpl=fetch){const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),20000);try{const r=await fetchImpl(url,{signal:ac.signal,headers:{accept:'application/json','user-agent':'little-days-dividend-bot/1.5.5'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}finally{clearTimeout(timer);}}
async function loadPrevious(output){try{return JSON.parse(await fs.readFile(output,'utf8'));}catch{return {items:[]};}}

export async function updateDividendData({now=new Date(),fetchImpl=fetch,output=OUTPUT}={}){
  const previous=await loadPrevious(output),prevItems=Array.isArray(previous?.items)?previous.items:[];
  const etfResult=await Promise.allSettled([fetchText(TWSE_ETF_DIVIDEND_URL,fetchImpl).then(parseTwseEtfDividendHtml)]).then(x=>x[0]);
  const stockResult=await Promise.allSettled([fetchJson(TWSE_STOCK_EXDIV_URL,fetchImpl).then(parseTwseStockExdiv)]).then(x=>x[0]);
  const warnings=[],sources=[];
  let etfRows,stockRows;
  if(etfResult.status==='fulfilled'&&etfResult.value.length){etfRows=etfResult.value;sources.push({id:'TWSE_ETFORTUNE',url:TWSE_ETF_DIVIDEND_URL,status:'ok',rows:etfRows.length});}
  else{etfRows=prevItems.filter(x=>x.source==='TWSE_ETFORTUNE');warnings.push({source:'TWSE_ETFORTUNE',error:String(etfResult.status==='rejected'?etfResult.reason?.message||etfResult.reason:'no rows parsed')});sources.push({id:'TWSE_ETFORTUNE',url:TWSE_ETF_DIVIDEND_URL,status:'fallback',rows:etfRows.length});}
  if(stockResult.status==='fulfilled'&&stockResult.value.length){stockRows=stockResult.value;sources.push({id:'TWSE_OPENAPI_TWT48U_ALL',url:TWSE_STOCK_EXDIV_URL,status:'ok',rows:stockRows.length});}
  else{stockRows=prevItems.filter(x=>x.source==='TWSE_OPENAPI_TWT48U_ALL');warnings.push({source:'TWSE_OPENAPI_TWT48U_ALL',error:String(stockResult.status==='rejected'?stockResult.reason?.message||stockResult.reason:'no rows parsed')});sources.push({id:'TWSE_OPENAPI_TWT48U_ALL',url:TWSE_STOCK_EXDIV_URL,status:'fallback',rows:stockRows.length});}
  const items=mergeDividendRows([...stockRows,...etfRows]);
  if(!items.length)throw new Error(`No dividend rows available: ${JSON.stringify(warnings)}`);
  const payload={schemaVersion:2,generatedAt:now.toISOString(),sourcePolicy:'official-only',coverage:{etf:'ex-date + record-date + expected payment date + per-unit distribution',listedStock:'ex-date + cash dividend; payment date remains blank when official dataset does not provide it'},sources,warnings,items};
  await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,`${JSON.stringify(payload,null,2)}\n`,'utf8');return payload;
}

const isMain=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isMain)updateDividendData().then(p=>console.log(`dividend-calendar updated: ${p.items.length} events`)).catch(e=>{console.error(e);process.exitCode=1;});
