import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as records from '../js/records.js';
import * as rules from '../js/rules.js';
import * as ui from '../js/ui.js';

test('rendered homepage, paid list and trash stay linked through deletion, restoration and external updates',async()=>{
 const rows=[{id:'paid',status:'已請款',name:'QA-paid',date:'2026-10-05',createdAt:'2026-10-05',updatedAt:'2026-10-05T00:00:00Z',expenses:[],batchId:'batch1'}];
 const app={innerHTML:''};
 const context=vm.createContext({
  ...records,...rules,...ui,URLSearchParams,location:{search:''},
  document:{querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[]},
  db:{
   all:async name=>name==='events'?structuredClone(rows):[],
   changeDeletion:async(ids,restore)=>{
    let changed=0;
    for(let i=0;i<rows.length;i++)if(ids.includes(rows[i].id)){
     const next=(restore?records.restoreRecord:records.deleteRecord)(rows[i]);
     if(next){rows[i]=next;changed++;}
    }
    return {changed,skipped:0};
   }
  },
  confirm:()=>true,alert:message=>{throw Error(message)},hasSyncConfig:()=>false
 });
 // Execute the real rendering/action functions with in-memory persistence and no external services.
 let source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 source=source.slice(0,source.indexOf("if ('serviceWorker' in navigator)"));
 vm.runInContext(source,context);
 const run=code=>vm.runInContext(code,context);
 await run('refresh()');
 assert.match(app.innerHTML,/QA-paid/);
 await run("state.page='paid'; refresh()");
 assert.match(app.innerHTML,/data-delete-event="paid"/);
 await run("changeDeletion(['paid'])");
 assert.doesNotMatch(app.innerHTML,/QA-paid/);
 await run("state.page='home'; refresh()");
 assert.doesNotMatch(app.innerHTML,/QA-paid/);
 await run("state.page='deleted'; refresh()");
 assert.match(app.innerHTML,/QA-paid/);
 assert.match(app.innerHTML,/還原到已請款/);
 await run("changeDeletion(['paid'],true)");
 assert.equal(rows[0].status,'已請款');
 assert.equal(rows[0].batchId,'batch1');
 await run("state.page='home'; refresh()");
 assert.match(app.innerHTML,/QA-paid/);
 rows[0].status='待請款';
 await run("state.page='pending'; refresh()");
 assert.match(app.innerHTML,/QA-paid/);
 await run("state.page='paid'; refresh()");
 assert.doesNotMatch(app.innerHTML,/QA-paid/);
 await run("state.page='new'");
 app.innerHTML='unsaved form';
 await run('refresh(true)');
 assert.equal(app.innerHTML,'unsaved form');
});
