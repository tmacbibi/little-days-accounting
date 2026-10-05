import test from 'node:test';
import assert from 'node:assert/strict';
import {returnToPendingRecord,deleteRecord,mergeRows,eventViews} from '../js/records.js';

test('return a paid record to pending with unchanged details and a new sync timestamp',()=>{
 const paid={id:'paid',status:'已請款',batchId:'old-batch',updatedAt:'2030-01-01T00:00:00Z',expenses:[{type:'停車費',amount:100}]};
 const pending=returnToPendingRecord(paid,Date.parse('2026-10-05'));
 assert.equal(pending.status,'待請款');
 assert.equal(pending.batchId,null);
 assert.equal(pending.previousBatchId,'old-batch');
 assert.deepEqual(pending.expenses,paid.expenses);
 assert(Date.parse(pending.updatedAt)>Date.parse(paid.updatedAt));
 for(const rows of [mergeRows([paid],[pending]),mergeRows([pending],[paid])]){
  assert.equal(eventViews(rows).pending.length,1);
  assert.equal(eventViews(rows).paid.length,0);
 }
 assert.equal(returnToPendingRecord(pending),null);
 assert.equal(returnToPendingRecord(deleteRecord(paid)),null);
 assert.equal(returnToPendingRecord({...paid,status:'已產生表單'}).status,'待請款');
});
