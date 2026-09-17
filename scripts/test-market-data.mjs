import assert from 'node:assert/strict';
import {
  normalizeDate, parseTPEx, parseTWSEReport, parseTWSEReportIndex, parseTPExIndex,
  parseHolidaySchedule, expectedTradeDateFromClosures, fetchJsonWithRetry, mergeMarketSnapshots
} from './update-market-data.mjs';

assert.equal(normalizeDate('20260917'),'2026-09-17');
assert.equal(normalizeDate('1150917'),'2026-09-17');
assert.equal(normalizeDate('115/09/17'),'2026-09-17');

const twseReport={date:'20260917',tables:[
  {fields:['指數','收盤指數','漲跌(+/-)','漲跌點數'],data:[['發行量加權股價指數','25,500.00','+','120.00']]},
  {fields:['證券代號','證券名稱','成交股數','收盤價','漲跌(+/-)','漲跌價差'],data:[['0050','元大台灣50','1000','108.50','+','1.20'],['2330','台積電','2000','1,260.00','-','5.00']]}
]};
const twse=parseTWSEReport(twseReport);
assert.equal(twse.length,2); assert.equal(twse[0].date,'2026-09-17'); assert.equal(twse[1].change,-5);
const taiex=parseTWSEReportIndex(twseReport)[0]; assert.equal(taiex.code,'TAIEX'); assert.equal(taiex.date,'2026-09-17');

const tpex=parseTPEx([{SecuritiesCompanyCode:'00937B',CompanyName:'群益ESG投等債20+',Close:'14.25',Date:'1150917'}]);
assert.equal(tpex.length,1); assert.equal(tpex[0].date,'2026-09-17');
assert.equal(parseTPEx([{SecuritiesCompanyCode:'00937B',CompanyName:'X',Close:'14.25'}]).length,0,'TPEx quote without official date must be rejected');
const otc=parseTPExIndex([{Date:'1150917',TPExIndex:'300.15',Change:'1.20'}])[0]; assert.equal(otc.date,'2026-09-17');

// Official holiday calendar: explicit "交易日" rows stay open; holidays/settlement-only dates close.
const closed=parseHolidaySchedule({data:[
  ['2026-09-25','中秋節','依規定放假1日。'],
  ['2026-02-11','農曆春節前最後交易日',''],
  ['2026-02-12','市場無交易，僅辦理結算交割作業','']
]});
assert.equal(closed.has('2026-09-25'),true);
assert.equal(closed.has('2026-02-11'),false);
assert.equal(closed.has('2026-02-12'),true);
assert.equal(expectedTradeDateFromClosures('2026-09-27',closed),'2026-09-24','weekend after Friday holiday should roll back to Thursday');
assert.equal(expectedTradeDateFromClosures('2026-09-25',closed),'2026-09-24','holiday should not be misclassified as a missing quote day');
assert.equal(expectedTradeDateFromClosures('2026-09-17',closed),'2026-09-17');

const previousMaster={schemaVersion:1,items:[
  {symbol:'0050',name:'元大台灣50',shortName:'台灣50',market:'TWSE',securityType:'etf'},
  {symbol:'00937B',name:'群益ESG投等債20+',shortName:'ESG投等債20+',market:'TPEx',securityType:'bond-etf'}
]};
const previousQuotes={schemaVersion:1,latestTradeDate:'2026-09-15',indices:[
  {code:'TAIEX',name:'加權指數',market:'TWSE',date:'2026-09-15',value:25000},
  {code:'OTC',name:'櫃買指數',market:'TPEx',date:'2026-09-15',value:295}
],items:[
  {symbol:'0050',name:'元大台灣50',market:'TWSE',securityType:'etf',date:'2026-09-15',close:107,previousClose:106,change:1,changePct:0.94},
  {symbol:'00937B',name:'群益ESG投等債20+',market:'TPEx',securityType:'bond-etf',date:'2026-09-15',close:14,previousClose:13.9,change:0.1,changePct:0.72}
]};

const freshTwse={ok:true,market:'TWSE',source:'fixture',tradeDate:'2026-09-17',rows:[{symbol:'0050',name:'元大台灣50',market:'TWSE',securityType:'etf',date:'2026-09-17',close:108.5,change:1.5,changePct:0}],index:{code:'TAIEX',name:'加權指數',market:'TWSE',date:'2026-09-17',value:25500,change:120,changePct:0.47}};
const freshTpex={ok:true,market:'TPEx',source:'fixture',tradeDate:'2026-09-17',rows:[{symbol:'00937B',name:'群益ESG投等債20+',market:'TPEx',securityType:'bond-etf',date:'2026-09-17',close:14.25,change:0.25,changePct:0}],index:{code:'OTC',name:'櫃買指數',market:'TPEx',date:'2026-09-17',value:300.15,change:1.2,changePct:0.4}};

let merged=mergeMarketSnapshots(previousMaster,previousQuotes,[freshTwse,freshTpex],new Date('2026-09-17T10:00:00Z'),'2026-09-17');
assert.equal(merged.summary.quality,'ok');
assert.equal(merged.quotes.latestTradeDate,'2026-09-17');
assert.equal(merged.quotes.items.find(x=>x.symbol==='0050').close,108.5);
assert.equal(merged.quotes.items.find(x=>x.symbol==='0050').isStale,false);
assert.equal(merged.master.items.find(x=>x.symbol==='0050').shortName,'台灣50','existing shortName must survive refresh');

const failedTpex={ok:false,market:'TPEx',source:'fixture',error:'terminated'};
merged=mergeMarketSnapshots(previousMaster,previousQuotes,[freshTwse,failedTpex],new Date('2026-09-17T10:00:00Z'),'2026-09-17');
assert.equal(merged.summary.quality,'partial');
assert.equal(merged.quotes.marketTradeDates.TWSE,'2026-09-17');
assert.equal(merged.quotes.marketTradeDates.TPEx,'2026-09-15');
assert.equal(merged.quotes.latestTradeDate,'2026-09-15','overall date must be conservative when markets are mixed');
const staleTpex=merged.quotes.items.find(x=>x.symbol==='00937B');
assert.equal(staleTpex.date,'2026-09-15'); assert.equal(staleTpex.close,14); assert.equal(staleTpex.isStale,true,'failed TPEx must never be relabeled as 9/17');
assert.equal(merged.quotes.items.find(x=>x.symbol==='0050').date,'2026-09-17');

// Valid-but-old source data must be publishable only as stale/partial, never green/fresh.
const oldButValidTwse={...freshTwse,tradeDate:'2026-09-16',rows:freshTwse.rows.map(x=>({...x,date:'2026-09-16',close:108}))};
merged=mergeMarketSnapshots(previousMaster,previousQuotes,[oldButValidTwse,freshTpex],new Date('2026-09-17T10:00:00Z'),'2026-09-17');
assert.equal(merged.summary.quality,'partial');
assert.equal(merged.quotes.marketFreshness.TWSE,'stale');
assert.match(merged.quotes.sourceStatus.TWSE,/stale:/);
assert.equal(merged.quotes.items.find(x=>x.symbol==='0050').date,'2026-09-16');
assert.equal(merged.quotes.items.find(x=>x.symbol==='0050').isStale,true);

const regressedTwse={...freshTwse,tradeDate:'2026-09-14',rows:freshTwse.rows.map(x=>({...x,date:'2026-09-14',close:90}))};
merged=mergeMarketSnapshots(previousMaster,previousQuotes,[regressedTwse,failedTpex],new Date('2026-09-17T10:00:00Z'),'2026-09-17');
const preserved=merged.quotes.items.find(x=>x.symbol==='0050');
assert.equal(preserved.date,'2026-09-15'); assert.equal(preserved.close,107,'older source data must never overwrite newer stored quote'); assert.equal(preserved.isStale,true);

// First run with no stored data and one market down: do not invent a date/price for the failed market.
merged=mergeMarketSnapshots({schemaVersion:1,items:[]},{schemaVersion:1,items:[],indices:[]},[freshTwse,failedTpex],new Date('2026-09-17T10:00:00Z'),'2026-09-17');
assert.equal(merged.summary.quality,'partial');
assert.equal(merged.quotes.items.some(x=>x.market==='TPEx'),false);
assert.equal(merged.quotes.marketTradeDates.TPEx,'');

// Network defenses: HTML masquerading as 200/JSON and terminated connection both retry then fail clearly.
const originalFetch=globalThis.fetch;
try {
  let htmlAttempts=0;
  globalThis.fetch=async()=>{htmlAttempts++; return new Response('<html>blocked</html>',{status:200,headers:{'content-type':'text/html'}});};
  await assert.rejects(()=>fetchJsonWithRetry('https://example.invalid/html',{attempts:2,timeoutMs:100}),/received HTML instead of JSON/);
  assert.equal(htmlAttempts,2);

  let terminatedAttempts=0;
  globalThis.fetch=async()=>{terminatedAttempts++; throw new Error('terminated');};
  await assert.rejects(()=>fetchJsonWithRetry('https://example.invalid/terminated',{attempts:3,timeoutMs:100}),/terminated/);
  assert.equal(terminatedAttempts,3);
} finally {
  globalThis.fetch=originalFetch;
}

console.log('market-data final parser/freshness/safe-merge/network tests passed');
