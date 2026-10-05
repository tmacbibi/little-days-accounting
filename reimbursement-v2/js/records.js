export function isDeleted(row) {
  return !!row?.deletedAt || row?.status === '已刪除';
}

function timestamp(value) {
  const t = Date.parse(value || '');
  return Number.isFinite(t) ? t : 0;
}

function recordTime(row) {
  return timestamp(row?.updatedAt || row?.createdAt);
}

function nextTime(row, now) {
  return new Date(Math.max(now, recordTime(row) + 1, timestamp(row.deletedAt) + 1, timestamp(row.restoredAt) + 1)).toISOString();
}

export function deletePendingRecord(row, now = Date.now()) {
  if (!row || isDeleted(row) || row.status !== '待請款') return null;
  const deletedAt = nextTime(row, now);
  return {...row, previousStatus:'待請款', status:'已刪除', deletedAt, updatedAt:deletedAt};
}

export function restorePendingRecord(row, now = Date.now()) {
  if (!row || !isDeleted(row) || row.previousStatus !== '待請款') return null;
  const restoredAt = nextTime(row, now);
  return {...row, status:'待請款', deletedAt:null, restoredAt, updatedAt:restoredAt};
}

export function mergeRows(localRows, cloudRows) {
  const records = new Map();
  for (const row of [...cloudRows, ...localRows]) {
    if (!row?.id) continue;
    const previous = records.get(row.id);
    if (!previous) { records.set(row.id, row); continue; }
    if (isDeleted(previous) !== isDeleted(row)) {
      const deleted = isDeleted(row) ? row : previous;
      const active = isDeleted(row) ? previous : row;
      // 只有明確按「還原」的新版本，才可以取消刪除；舊裝置的普通修改不能讓項目復活。
      const winner = timestamp(active.restoredAt) > timestamp(deleted.deletedAt || deleted.updatedAt) ? active : deleted;
      const other = winner === active ? deleted : active;
      // 現行 Apps Script 以 updatedAt 決定寫入；同步舊裝置較晚的修改時，也須讓刪除／還原版本能寫回。
      records.set(row.id, recordTime(winner) < recordTime(other)
        ? {...winner, updatedAt:new Date(recordTime(other)+1).toISOString()} : winner);
    } else if (recordTime(row) >= recordTime(previous)) {
      records.set(row.id, row);
    }
  }
  return [...records.values()];
}
