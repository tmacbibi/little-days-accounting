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