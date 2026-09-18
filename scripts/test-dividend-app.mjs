import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const store=new Map();
const REAL_DATE=Date;
const FIXED_NOW='2026-09-18T01:00:00.000Z';
class FixedDate extends REAL_DATE{
  constructor(...args){super(...(args.length?args:[FIXED_NOW]));}
  static now(){return new REAL_DATE(FIXED_NOW).getTime();}
  static parse(v){return REAL_DATE.parse(v);}
  static UTC(...args){return REAL_DATE.UTC(...args);}
}
const sandbox={
  console,
  structuredClone:globalThis.structuredClone,
  TextEncoder,TextDecoder,
  Blob:globalThis.Blob,
  URL:globalThis.URL,
  AbortController:globalThis.AbortController,
  setTimeout,clearTimeout,
  Date:FixedDate,
  fetch:async()=>{throw new Error('network disabled in test');},
  confirm:()=>true,prompt:()=>null,
  navigator:{},
  window:{addEventListener(){},location:{reload(){}}},
  document:{baseURI:'https://example.test/',getElementById(){return null;},querySelectorAll(){return[];},addEventListener(){},body:{classList:{add(){},remove(){}}}},
  localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  crypto:globalThis.crypto,
};
vm.createContext(sandbox);
vm.runInContext(code,sandbox,{filename:'app.js'});

vm.runInContext(`
  unlocked=true; vaultLoaded=true;
  settings={dividendAutoStartDate:'2026-09-16'};
  investmentQuotes=[]; dividendEvents=[];
  investmentLedger=[
    {id:'i1',kind:'initial',symbol:'00919',date:'2026-09-01',quantity:100,price:20,fee:0,tax:0,status:'complete',createdAt:'2026-09-01T00:00:00Z'},
    {id:'b1',kind:'buy',symbol:'00919',date:'2026-09-10',quantity:50,price:21,fee:0,tax:0,status:'complete',createdAt:'2026-09-10T00:00:00Z'},
    {id:'s1',kind:'sell',symbol:'00919',date:'2026-09-16',quantity:20,price:22,fee:0,tax:0,status:'complete',createdAt:'2026-09-16T01:00:00Z'}
  ];
`,sandbox);
assert.equal(vm.runInContext(`investmentSharesAsOf('00919','2026-09-15')`,sandbox),150,'ex-date entitlement must use prior-day shares');

vm.runInContext(`
  loadStaticDividendCalendar=async()=>({generatedAt:'2026-09-16T08:00:00Z',items:[{symbol:'00919',name:'群益台灣精選高息',securityType:'etf',exDate:'2026-09-16',recordDate:'2026-09-22',expectedPayDate:'2026-10-15',perShare:1.1,source:'TWSE_ETFORTUNE',sourceUrl:'official'}]});
  persistState=async()=>{}; renderAll=()=>{}; renderDividendCalendar=()=>{};
`,sandbox);
const firstResult=await vm.runInContext(`syncOfficialDividendCalendar({silent:true})`,sandbox);
const firstError=vm.runInContext(`settings.dividendLastSyncError||''`,sandbox);
assert.equal(firstResult?.error,undefined,`sync should not fail: ${firstError}`);
assert.equal(vm.runInContext(`dividendEvents.length`,sandbox),1,`expected one official dividend event; sync error: ${firstError}`);
assert.equal(vm.runInContext(`dividendEvents[0].entitledShares`,sandbox),150);
assert.equal(vm.runInContext(`dividendEvents[0].expectedPayDate`,sandbox),'2026-10-15');
assert.equal(vm.runInContext(`dividendDerived(dividendEvents[0],'2026-09-16').estimatedAmount`,sandbox),165);

// Later buys must not change the frozen entitlement.
vm.runInContext(`investmentLedger.push({id:'b2',kind:'buy',symbol:'00919',date:'2026-09-17',quantity:100,price:20,fee:0,tax:0,status:'complete',createdAt:'2026-09-17T00:00:00Z'});`,sandbox);
assert.equal(vm.runInContext(`dividendDerived(dividendEvents[0],'2026-09-20').entitledShares`,sandbox),150);

// Official schedule changes may update expected date, but confirmed actual values survive.
vm.runInContext(`dividendEvents[0].actualPayDate='2026-10-15'; dividendEvents[0].actualAmount=160; loadStaticDividendCalendar=async()=>({generatedAt:'2026-09-20T08:00:00Z',items:[{symbol:'00919',name:'群益台灣精選高息',securityType:'etf',exDate:'2026-09-16',recordDate:'2026-09-22',expectedPayDate:'2026-10-16',perShare:1.1,source:'TWSE_ETFORTUNE',sourceUrl:'official'}]});`,sandbox);
const secondResult=await vm.runInContext(`syncOfficialDividendCalendar({force:true,silent:true})`,sandbox);
assert.equal(secondResult?.error,undefined,`resync should not fail: ${vm.runInContext(`settings.dividendLastSyncError||''`,sandbox)}`);
assert.equal(vm.runInContext(`dividendEvents[0].expectedPayDate`,sandbox),'2026-10-16');
assert.equal(vm.runInContext(`dividendEvents[0].actualPayDate`,sandbox),'2026-10-15');
assert.equal(vm.runInContext(`dividendEvents[0].actualAmount`,sandbox),160);
console.log('dividend app integration tests passed');
