import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as records from '../js/records.js';
import * as rules from '../js/rules.js';
import * as ui from '../js/ui.js';

test('batch creation shows progress immediately and ignores repeated clicks while syncing',async()=>{
 let release;const syncWait=new Promise(resolve=>release=resolve);
 let writes=0;const app={innerHTML:'',querySelectorAll:()=>[]};
 const context=vm.createContext({...records,...rules,...ui,URLSearchParams,
  location:{search:'',href:''},uid:()=> 'batch-test',
  document:{querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[]},
  db:{all:async()=>[{id:'event',status:'待請款'}],put:async()=>{writes++},merge:async()=>{}},
  hasSyncConfig:()=>true,syncNow:async cb=>{cb('正在寫入雲端…');await syncWait},
  alert:()=>{}
 });
 let source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 source=source.slice(0,source.indexOf("if ('serviceWorker' in navigator)"));
 vm.runInContext(source,context);
 vm.runInContext("state.page='pending';state.events=[{id:'event',status:'待請款'}];state.selected.add('event')",context);
 const first=vm.runInContext('createSelectedBatch()',context);
 assert.match(app.innerHTML,/建立中…/);
 assert.match(app.innerHTML,/aria-busy="true"/);
 await vm.runInContext('createSelectedBatch()',context);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(writes,1);
 assert.match(app.innerHTML,/正在寫入雲端/);
 release();await first;
 assert.equal(context.location.href,'./batch.html');
 assert.match(app.innerHTML,/建立成功/);
});
