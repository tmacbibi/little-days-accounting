import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteRecord, restoreRecord, mergeRows, isDeleted, eventViews} from '../js/records.js';

const pending = {id:'test',status:'待請款',name:'測試項目',updatedAt:'2026-10-01T00:00:00.000Z',expenses:[{type:'停車費',amount:150}],batchId:'batch1'};
const day = n=>Date.parse(`2026-10-${String(n).padStart(2,'0')}T00:00:00Z`);

test('delete eligible entries and preserve their details for restoration',()=>{
  const deleted=deleteRecord(pending,day(5));
  assert(isDeleted(deleted));
  assert.deepEqual(deleted.expenses,pending.expenses);
  assert.equal(deleted.batchId,pending.batchId);
  assert(isDeleted(deleteRecord({...pending,status:'已請款'})));
  assert.equal(deleteRecord(deleted),null);
  assert.equal(restoreRecord({...deleted,previousStatus:'未知'}),null);
});

test('stale active copies cannot resurrect a deleted entry in either merge direction',()=>{
  const deleted=deleteRecord(pending,day(5));
  const stale={...pending,updatedAt:new Date(day(6)).toISOString()};
  for(const [local,cloud] of [[deleted,stale],[stale,deleted]]){
    const merged=mergeRows([local],[cloud])[0];
    assert(isDeleted(merged));
    assert(Date.parse(merged.updatedAt)>Date.parse(stale.updatedAt));
    // Existing Apps Script accepts the winning marker, using its unchanged timestamp comparison.
    assert(merged.updatedAt>=stale.updatedAt);
  }
});

test('explicit restore propagates to a second device and another deletion wins again',()=>{
  const deleted=deleteRecord(pending,day(5));
  let cloud=mergeRows([deleted],[pending]);
  let secondDevice=mergeRows([pending],cloud);
  assert(secondDevice.every(isDeleted));
  const restored=restoreRecord(deleted,day(7));
  cloud=mergeRows([restored],cloud);
  secondDevice=mergeRows(secondDevice,cloud);
  assert(!isDeleted(secondDevice[0]));
  const deletedAgain=deleteRecord(restored,day(8));
  assert(isDeleted(mergeRows([deletedAgain],[restored])[0]));
  assert(isDeleted(mergeRows([restored],[deletedAgain])[0]));
});

test('clock skew remains monotonic and ordinary edits retain last-write-wins behavior',()=>{
  const future={...pending,updatedAt:'2030-01-01T00:00:00Z'};
  const deleted=deleteRecord(future,day(5));
  assert(Date.parse(deleted.updatedAt)>Date.parse(future.updatedAt));
  const restored=restoreRecord(deleted,day(6));
  assert(Date.parse(restored.updatedAt)>Date.parse(deleted.updatedAt));
  const newer={...pending,name:'更新',updatedAt:new Date(day(2)).toISOString()};
  assert.equal(mergeRows([pending],[newer])[0].name,'更新');
});

for (const status of ['待請款','已請款','已產生表單']) {
  test(status + ': all views remove the event and restore its original status and metadata',()=>{
    const row={...pending,status,createdAt:'2026-10-01',driveFiles:[{id:'pdf1'}]};
    const deleted=deleteRecord(row,day(5));
    const stale={...row,updatedAt:new Date(day(6)).toISOString()};
    const synced=mergeRows([stale],[deleted]);
    const views=eventViews(synced);
    for(const name of ['active','recent','pending','paid']) assert.equal(views[name].length,0);
    assert.equal(views.deleted.length,1);
    const restored=restoreRecord(synced[0],day(7));
    const device=mergeRows([deleted],[restored]);
    const recovered=eventViews(device);
    assert.equal(recovered.deleted.length,0);
    assert.equal(recovered.recent[0].status,status);
    assert.equal(recovered[status==='待請款'?'pending':'paid'].length,1);
    assert.equal(recovered.active[0].batchId,row.batchId);
    assert.deepEqual(recovered.active[0].driveFiles,row.driveFiles);
    assert.deepEqual(recovered.active[0].expenses,row.expenses);
  });
}
