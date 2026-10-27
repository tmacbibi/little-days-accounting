export const TRAVEL_PURPOSES = ['開會', '審查會議', '工作會議', '現場會勘', '現地調查', '其他'];

export function travelPurpose(event) {
  return event.travelPurpose === '其他'
    ? String(event.travelPurposeOther || '').trim()
    : String(event.travelPurpose || '').trim();
}

// Old records remain readable. Require the new fields when saving a domestic
// trip or producing a new form, rather than guessing from the event name.
export function missingTravelFields(event) {
  if (event.eventType !== '國內出差') return [];
  const missing = [];
  if (!travelPurpose(event)) missing.push('出差事由');
  if (!String(event.travelLocation || '').trim()) missing.push('出差地點');
  const route = String(event.route || '').split(/[－—–-]/).map(s => s.trim()).filter(Boolean);
  if (!String(event.startLocation ?? route[0] ?? '').trim()) missing.push('起點');
  if (!String(event.endLocation ?? route.slice(1).join('－')).trim()) missing.push('迄點');
  return missing;
}

export function assertTravelFields(events) {
  const invalid = events.map(event => ({event, missing: missingTravelFields(event)}))
    .filter(item => item.missing.length);
  if (invalid.length) {
    throw new Error('請先回首頁點選事件補填，再重新產製 PDF：\n' + invalid.map(({event, missing}) =>
      `${event.name || event.date || '未命名事件'}：${missing.join('、')}`).join('\n'));
  }
}
