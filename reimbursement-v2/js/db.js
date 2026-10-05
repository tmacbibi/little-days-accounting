import { deleteRecord, restoreRecord, returnToPendingRecord } from './records.js';

const DB_NAME = 'reimbursement-pwa-v2';
const DB_VERSION = 1;
const STORES = ['events','batches','meta'];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('events')) {
        const store = db.createObjectStore('events', { keyPath: 'id' });
        store.createIndex('status','status');
        store.createIndex('date','date');
        store.createIndex('batchId','batchId');
      }
      if (!db.objectStoreNames.contains('batches')) {
        const store = db.createObjectStore('batches', { keyPath: 'id' });
        store.createIndex('createdAt','createdAt');
      }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = fn(store);
    transaction.oncomplete = () => resolve(result?.result ?? result);
    transaction.onerror = () => reject(transaction.error);
  });
}

export const db = {
  async returnToPending(ids) { return this.changeDeletion(ids, false, true); },
  async changeDeletion(ids, restore = false, returnPending = false) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('events', 'readwrite');
      const store = transaction.objectStore('events');
      const result = {changed:0, skipped:0};
      const now = Date.now();
      for (const id of new Set(ids)) {
        const req = store.get(id);
        req.onsuccess = () => {
          const row = (returnPending ? returnToPendingRecord : restore ? restoreRecord : deleteRecord)(req.result, now);
          if (row) { store.put(row); result.changed++; } else result.skipped++;
        };
      }
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('刪除／還原未完成'));
    });
  },
  async merge(storeName, incoming, mergeRows) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      let rows = [];
      const req = store.getAll();
      req.onsuccess = () => {
        rows = mergeRows(req.result || [], incoming);
        rows.forEach(row => store.put(row));
      };
      transaction.oncomplete = () => resolve(rows);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('同步合併未完成'));
    });
  },
  async put(storeName, value) { return tx(storeName, 'readwrite', store => store.put(value)); },
  async get(storeName, key) { return tx(storeName, 'readonly', store => store.get(key)); },
  async delete(storeName, key) { return tx(storeName, 'readwrite', store => store.delete(key)); },
  async all(storeName) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const req = database.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },
  async clear(storeName) { return tx(storeName, 'readwrite', store => store.clear()); },
  async exportAll() {
    const out = { schemaVersion: 1, exportedAt: new Date().toISOString() };
    for (const name of STORES) out[name] = await this.all(name);
    return out;
  },
  async importAll(payload) {
    if (!payload || payload.schemaVersion !== 1) throw new Error('不支援的備份格式');
    for (const name of STORES) {
      await this.clear(name);
      for (const row of payload[name] || []) await this.put(name, row);
    }
  }
};

export function uid(prefix='id') {
  return `${prefix}_${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(16).slice(2)}`;
}
