import test from 'node:test';
import assert from 'node:assert/strict';
import { travelPurpose, missingTravelFields, assertTravelFields } from '../js/travel-fields.js';
import { calculateEvent } from '../js/rules.js';
import { mergeRows } from '../js/records.js';

const trip = {id:'trip', name:'自由命名的事件', eventType:'國內出差',
  startLocation:'蘆洲', endLocation:'嘉義', route:'蘆洲－嘉義',
  travelPurpose:'審查會議', travelLocation:'嘉義縣政府', transport:'高鐵', highSpeedRailFare:1000};

test('dedicated form fields do not derive from event names or change amounts', () => {
  assert.deepEqual(missingTravelFields(trip), []);
  assert.equal(travelPurpose(trip), '審查會議');
  assert.equal(calculateEvent(trip).travelTotal, 1000);
  assert.equal(travelPurpose({...trip, name:'工作會議', travelPurpose:''}), '');
  assert.deepEqual(missingTravelFields({...trip, travelPurpose:'', travelLocation:''}), ['出差事由','出差地點']);
});

test('other purpose needs actual text and is printed without the category label', () => {
  assert.equal(travelPurpose({...trip, travelPurpose:'其他', travelPurposeOther:'  參加教育訓練  '}), '參加教育訓練');
  assert.deepEqual(missingTravelFields({...trip, travelPurpose:'其他', travelPurposeOther:' '}), ['出差事由']);
});

test('legacy routes work, missing fields block new PDFs, and non-travel events are unaffected', () => {
  const legacy = {...trip, startLocation:undefined, endLocation:undefined, travelPurpose:undefined, travelLocation:undefined};
  assert.deepEqual(missingTravelFields(legacy), ['出差事由','出差地點']);
  assert.throws(() => assertTravelFields([legacy]), /自由命名的事件：出差事由、出差地點/);
  assert.doesNotThrow(() => assertTravelFields([trip, {...legacy, eventType:'一般請款'}]));
  assert.deepEqual(missingTravelFields({...trip,startLocation:'',endLocation:''}), ['起點','迄點']);
});

test('whole-record sync retains the new fields and free event name on either device', () => {
  const old = {...trip, travelPurpose:undefined, travelLocation:undefined, updatedAt:'2026-10-01T00:00:00Z'};
  const updated = {...trip, travelPurpose:'其他', travelPurposeOther:'教育訓練', updatedAt:'2026-10-27T00:00:00Z'};
  for (const merged of [mergeRows([old],[updated]), mergeRows([updated],[old])]) {
    assert.deepEqual(merged, [updated]);
  }
});
