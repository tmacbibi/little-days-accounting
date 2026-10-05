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

export function deleteRecord(row, now = Date.now()) {
  if (!row || isDeleted(row) || !['待請款','已請款','已產生表單'].includes(row.status)) return null;
  const deletedAt = nextTime(row, now);
  return {...row, previousStatus:row.status, status:'已刪除', deletedAt, updatedAt:deletedAt};
}

export function restoreRecord(row, now = Date.now()) {
  if (!row || !isDeleted(row) || !['待請款','已請款','已產生表單'].includes(row.previousStatus)) return null;
  const restoredAt = nextTime(row, now);
  return {...row, status:row.previousStatus, deletedAt:null, restoredAt, updatedAt:restoredAt};
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

// All screens use the same active records; trash never contributes to totals.
export function eventViews(rows) {
  const active = rows.filter(row=>!isDeleted(row)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  return {
    active,
    recent: active.slice(0,4),
    pending: active.filter(row=>row.status==='待請款'),
    paid: active.filter(row=>['已請款','已產生表單'].includes(row.status)),
    deleted: rows.filter(isDeleted).sort((a,b)=>String(b.deletedAt).localeCompare(String(a.deletedAt)))
  };
}

export function returnToPendingRecord(row, now = Date.now()) {
  if (!row || isDeleted(row) || !['已請款','已產生表單'].includes(row.status)) return null;
  const updatedAt = nextTime(row, now);
  return {...row, status:'待請款', batchId:null, previousBatchId:row.batchId || row.previousBatchId || null, returnedAt:updatedAt, updatedAt};
}
