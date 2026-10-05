import test from 'node:test';
import assert from 'node:assert/strict';
import {deletePendingRecord, restorePendingRecord, mergeRows, isDeleted} from '../js/records.js';

const pending = {id:'test',status:'待請款',name:'測試項目',updatedAt:'2026-10-01T00:00:00.000Z',expenses:[{type:'停車費',amount:150}],batchId:'batch1'};
const day = n=>Date.parse(`2026-10-${String(n).padStart(2,'0')}T00:00:00Z`);

test('delete only pending entries and preserve their details for restoration',()=>{
  const deleted=deletePendingRecord(pending,day(5));
  assert(isDeleted(deleted));
  assert.deepEqual(deleted.expenses,pending.expenses);
  assert.equal(deleted.batchId,pending.batchId);
  assert.equal(deletePendingRecord({...pending,status:'已請款'}),null);
  assert.equal(deletePendingRecord(deleted),null);
  assert.equal(restorePendingRecord({...deleted,previousStatus:'已請款'}),null);
});

test('stale active copies cannot resurrect a deleted entry in either merge direction',()=>{
  const deleted=deletePendingRecord(pending,day(5));
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
  const deleted=deletePendingRecord(pending,day(5));
  let cloud=mergeRows([deleted],[pending]);
  let secondDevice=mergeRows([pending],cloud);
  assert(secondDevice.every(isDeleted));
  const restored=restorePendingRecord(deleted,day(7));
  cloud=mergeRows([restored],cloud);
  secondDevice=mergeRows(secondDevice,cloud);
  assert(!isDeleted(secondDevice[0]));
  const deletedAgain=deletePendingRecord(restored,day(8));
  assert(isDeleted(mergeRows([deletedAgain],[restored])[0]));
  assert(isDeleted(mergeRows([restored],[deletedAgain])[0]));
});

test('clock skew remains monotonic and ordinary edits retain last-write-wins behavior',()=>{
  const future={...pending,updatedAt:'2030-01-01T00:00:00Z'};
  const deleted=deletePendingRecord(future,day(5));
  assert(Date.parse(deleted.updatedAt)>Date.parse(future.updatedAt));
  const restored=restorePendingRecord(deleted,day(6));
  assert(Date.parse(restored.updatedAt)>Date.parse(deleted.updatedAt));
  const newer={...pending,name:'更新',updatedAt:new Date(day(2)).toISOString()};
  assert.equal(mergeRows([pending],[newer])[0].name,'更新');
});
