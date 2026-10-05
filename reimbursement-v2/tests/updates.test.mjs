import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

async function check({version='current',offline=false,fail=false}={}){
 let handler,reloaded=false,updated=false; const alerts=[];
 const button={disabled:false,textContent:''};
 const context=vm.createContext({
  APP_VERSION:'current', URL, AbortSignal, setTimeout,clearTimeout,
  document:{addEventListener:(name,fn)=>handler=fn},
  navigator:{onLine:!offline,serviceWorker:{register:async()=>({update:async()=>{updated=true},active:{state:'activated'}})}},
  fetch:async()=>{if(fail)throw Error('network');return {ok:true,json:async()=>({version})}},
  alert:msg=>alerts.push(msg),confirm:()=>true,location:{reload:()=>reloaded=true}
 });
 const source=fs.readFileSync(new URL('../js/updates.js',import.meta.url),'utf8')
  .replace(/^import .*;\n/,'').replaceAll('import.meta.url',"'https://example.com/app/js/updates.js'");
 vm.runInContext(source,context);
 await handler({target:{closest:()=>button}});
 return {alerts,reloaded,updated,button};
}
test('update checker reports latest, offline and errors, and activates before reload',async()=>{
 let r=await check();assert.match(r.alerts[0],/最新版本/);assert(!r.updated);assert(!r.reloaded);
 r=await check({version:'next'});assert(r.updated);assert(r.reloaded);
 r=await check({offline:true});assert.match(r.alerts[0],/離線/);assert(!r.reloaded);
 r=await check({fail:true});assert.match(r.alerts[0],/失敗/);assert(!r.button.disabled);
});
