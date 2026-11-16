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
run("selectedDate='2026-11-16';settings={};");
for(const [text,amounts] of [
['吃飯$100，充電$20',[100,20]],['吃飯100元充電20元',[100,20]],['吃飯100 充電20',[100,20]],
['吃飯一百元充電二十元',[100,20]],['午餐100元咖啡50元',[100,50]],['薪資$50,000，老婆分紅$2,000',[50000,2000]],
['11月16日午餐100元，充電20元',[100,20]],['投資0050 3000元',[3000]],
['吃飯＄１００，充電＄２０',[100,20]],['早餐50元，早餐50元',[50,50]]
]) assert.deepEqual(JSON.parse(run('JSON.stringify(parseVoiceItems('+JSON.stringify(text)+').map(x=>x.amount))')),amounts,text);
assert.equal(run("parseVoiceItems('老婆分紅2000元')[0].incomeCategory"),'老婆分紅');
assert.equal(run("parseVoiceItems('11月16日').length"),0,'a date alone must not become a transaction');
assert.equal(run("parseVoiceItems('吃飯100元充電20元')[1].subcategory"),'充電費');
assert.deepEqual(JSON.parse(run("JSON.stringify(parseVoiceItems('午餐現金100元，充電刷卡20元').map(x=>x.payment))")),['cash','card']);
run("persistState=async()=>{};renderAll=()=>{};renderIncomeCategoryOptions=()=>{};renderIncomeCategoryManager=()=>{};");
await run("saveIncomeCategoryName(null,'稿費')");
assert.ok(run("incomeCategoryNames().includes('稿費')"));
await run("saveIncomeCategoryName('老婆分紅','家庭分紅')");
assert.equal(run("incomeCategoryLabel('老婆分紅')"),'家庭分紅');
assert.equal(run("parseVoiceItems('老婆分紅2000元')[0].incomeCategory"),'老婆分紅');
await assert.rejects(run("saveIncomeCategoryName(null,'家庭分紅')"));
await assert.rejects(run("saveIncomeCategoryName(null,'   ')"));
console.log('multi-item parsing, currency, dates, Chinese amounts, independent items, payments, wife bonus and category naming passed');

