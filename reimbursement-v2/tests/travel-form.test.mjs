import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as records from '../js/records.js';
import * as rules from '../js/rules.js';
import * as ui from '../js/ui.js';
import * as travel from '../js/travel-fields.js';

test('event form keeps labels and help text, persists separate trip fields, and preserves free names', () => {
  const values = {name:'我的自由名稱', date:'2026-10-27', eventType:'國內出差',
    startLocation:'蘆洲', endLocation:'嘉義', travelPurpose:'其他',
    travelPurposeOther:'參加教育訓練', travelLocation:'嘉義縣政府', transport:'高鐵', highSpeedRailFare:'1000'};
  const form = {querySelectorAll:()=>[]};
  const context = vm.createContext({...records,...rules,...ui,...travel, URLSearchParams,
    location:{search:''}, document:{querySelector:s=>s==='#eventForm'?form:null},
    FormData:class {get(key){return values[key]??null;}}
  });
  let source = fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  source = source.slice(0,source.indexOf("if ('serviceWorker' in navigator)"));
  vm.runInContext(source,context);
  const draft = vm.runInContext('collectForm()',context);
  assert.equal(draft.name,'我的自由名稱');
  assert.equal(draft.travelPurposeOther,'參加教育訓練');
  assert.equal(draft.travelLocation,'嘉義縣政府');
  assert.equal(draft.route,'蘆洲－嘉義');
  context.draft = draft;
  vm.runInContext('state.editing=draft',context);
  const html = vm.runInContext('newPage()',context);
  assert.match(html,/自由命名，方便在首頁辨識/);
  assert.match(html,/placeholder="例：嘉義縣政府、臺北市政府"/);
  for (const field of ['name','startLocation','endLocation','travelPurpose','travelPurposeOther','travelLocation']) {
    assert.match(html,new RegExp(`name="${field}"[^>]*required`));
  }
  vm.runInContext("state.editing={...draft,eventType:'一般請款'}",context);
  const generalHtml = vm.runInContext('newPage()',context);
  for (const field of ['travelPurpose','travelPurposeOther','travelLocation']) {
    assert.doesNotMatch(generalHtml,new RegExp(`name="${field}"[^>]*required`));
  }
});
