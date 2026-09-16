import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const store=new Map();
const sandbox={
  console,
  structuredClone:globalThis.structuredClone,
  TextEncoder,TextDecoder,
  Blob:globalThis.Blob,
  URL:globalThis.URL,
  AbortController:globalThis.AbortController,
  setTimeout,clearTimeout,
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
  unlocked=true; vaultLoaded=true; settings={}; investmentQuotes=[]; dividendEvents=[];
  investmentLedger=[
    {id:'i1',kind:'initial',symbol:'00919',date:'2026-09-01',quantity:100,price:20,fee:0,tax:0,status:'complete',createdAt:'2026-09-01T00:00:00Z'},
    {id:'b1',kind:'buy',symbol:'00919',date:'2026-09-10',quantity:50,price:21,fee:0,tax:0,status:'complete',createdAt:'2026-09-10T00:00:00Z'},
    {id:'s1',kind:'sell',symbol:'00919',date:'2026-09-16',quantity:20,price:22,fee:0,tax:0,status:'complete',createdAt:'2026-09-16T01:00:00Z'}
  ];
`,sandbox);
assert.equal(vm.runInContext(`investmentSharesAsOf('00919','2026-09-15')`,sandbox),150);

vm.runInContext(`
  loadStaticDividendCalendar=async()=>({generatedAt:'2026-09-16T08:00:00Z',items:[{symbol:'00919',name:'群益台灣精選高息',securityType:'etf',exDate:'2026-09-16',recordDate:'2026-09-22',expectedPayDate:'2026-10-15',perShare:1.1,source:'TWSE_ETFORTUNE',sourceUrl:'official'}]});
  persistState=async()=>{}; renderAll=()=>{};
`,sandbox);
await vm.runInContext(`syncOfficialDividendCalendar({silent:true})`,sandbox);
assert.equal(vm.runInContext(`dividendEvents.length`,sandbox),1);
assert.equal(vm.runInContext(`dividendEvents[0].entitledShares`,sandbox),150);
assert.equal(vm.runInContext(`dividendEvents[0].expectedPayDate`,sandbox),'2026-10-15');
assert.equal(vm.runInContext(`dividendDerived(dividendEvents[0],'2026-09-16').estimatedAmount`,sandbox),165);

// Later buys must not change the frozen entitlement.
vm.runInContext(`investmentLedger.push({id:'b2',kind:'buy',symbol:'00919',date:'2026-09-17',quantity:100,price:20,fee:0,tax:0,status:'complete',createdAt:'2026-09-17T00:00:00Z'});`,sandbox);
assert.equal(vm.runInContext(`dividendDerived(dividendEvents[0],'2026-09-20').entitledShares`,sandbox),150);

// Official schedule changes may update the expected date, but confirmed actual values survive.
vm.runInContext(`dividendEvents[0].actualPayDate='2026-10-15'; dividendEvents[0].actualAmount=160; loadStaticDividendCalendar=async()=>({generatedAt:'2026-09-20T08:00:00Z',items:[{symbol:'00919',name:'群益台灣精選高息',securityType:'etf',exDate:'2026-09-16',recordDate:'2026-09-22',expectedPayDate:'2026-10-16',perShare:1.1,source:'TWSE_ETFORTUNE',sourceUrl:'official'}]});`,sandbox);
await vm.runInContext(`syncOfficialDividendCalendar({force:true,silent:true})`,sandbox);
assert.equal(vm.runInContext(`dividendEvents[0].expectedPayDate`,sandbox),'2026-10-16');
assert.equal(vm.runInContext(`dividendEvents[0].actualPayDate`,sandbox),'2026-10-15');
assert.equal(vm.runInContext(`dividendEvents[0].actualAmount`,sandbox),160);
console.log('dividend app integration tests passed');
