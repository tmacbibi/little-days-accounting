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


const run=s=>vm.runInContext(s,sandbox);
run(`txns=[];investmentQuotes=[];dividendEvents=[];settings={};investmentLedger=[
{id:'buy',kind:'buy',symbol:'00981A',date:'2026-09-01',quantity:1000,price:100,fee:100,tax:0},
{id:'sell',kind:'sell',symbol:'00981A',date:'2026-09-10',quantity:500,price:120,fee:50,tax:60}
];reconcileInvestmentLinks();`);
assert.equal(run("txns.length"),1);
assert.equal(run("txns[0].amount"),9840);
assert.equal(run("txns[0].incomeCategory"),'股票已實現獲利');
assert.equal(run("investmentRealizedTransactions()[0].realized"),9840);
run("reconcileInvestmentLinks();reconcileRealizedIncome()");
assert.equal(run("txns.length"),1,'repeated reconciliation is idempotent');
run("investmentLedger[0].fee=200;reconcileInvestmentLinks()");
assert.equal(run("txns[0].amount"),9790,'buy-cost correction flows through');
run("investmentLedger[1].price=80;reconcileInvestmentLinks()");
assert.equal(run("txns.length"),0,'loss does not become income or living expense');
assert.equal(run("investmentRealizedTransactions()[0].realized"),-10210);
run("investmentLedger[1].price=120;investmentLedger[0].costPending=true;reconcileInvestmentLinks()");
assert.equal(run("txns.length"),0,'unknown cost must not invent profit');
run("investmentLedger[0].costPending=false;investmentLedger.push({id:'sell2',kind:'sell',symbol:'00981A',date:'2026-09-11',quantity:500,price:130,fee:50,tax:65});reconcileInvestmentLinks()");
assert.equal(run("txns.length"),2);
assert.equal(run("sum(txns)"),9790+14785);
run("investmentLedger=investmentLedger.filter(t=>t.id!=='sell');reconcileInvestmentLinks()");
assert.equal(run("txns.length"),1,'deleted sale removes only its income');
assert.equal(run("txns[0].realizedSellId"),'sell2');
run("investmentLedger[1].date='2099-01-01';reconcileInvestmentLinks()");
assert.equal(run("txns.length"),0,'future sales not recognized early');
run("investmentLedger[1].date='2026-09-11';reconcileInvestmentLinks();txns=JSON.parse(JSON.stringify(txns));reconcileInvestmentLinks()");
assert.equal(run("txns.length"),1,'backup restore does not duplicate');
run("investmentLedger[1].voided=true;reconcileInvestmentLinks()");
assert.equal(run("txns.length"),0,'voided sales disappear');
run("investmentLedger[1].voided=false;txns=[{id:'manual',type:'income',amount:14785,realizedSellId:'sell2',date:'2026-09-11'}];reconcileInvestmentLinks()");
assert.equal(run("txns.length"),1,'explicit linked manual record prevents duplicate');
run("txns=[];investmentLedger[1].quantity=1500;reconcileInvestmentLinks()");
assert.equal(run("txns.length"),0,'oversell must not create income');
run("investmentLedger[1].quantity=500;reconcileInvestmentLinks();openInvestmentTxnEditor=id=>globalThis.opened=id;openTxnMenu(txns[0].id)");
assert.equal(sandbox.opened,'sell2','income navigation edits source sale');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(index,/app-version" content="1.5.14"/);
assert.match(index,/個股股息分析版/);
assert.match(index,/id="realizedIncomeSummary"/);
console.log('realized income: FIFO fees/tax, partial sales, historical backfill, idempotence, cost edits, losses, pending costs, deletion, future/voided/oversold trades, restore, linked deduplication, navigation and version passed');

