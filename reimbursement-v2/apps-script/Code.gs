const CONFIG = {
  SECRET: 'PASTE_YOUR_PRIVATE_KEY_HERE',
  ROOT_FOLDER: '報帳系統'
};

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = safeCallback_(p.callback || 'callback');
  let result;

  if (p.mode === 'ping') {
    result = {
      ok: p.key === CONFIG.SECRET,
      service: '鼎漢報帳系統 Google Drive Bridge',
      version: '1.0.0'
    };
  } else if (p.mode === 'status') {
    if (p.key !== CONFIG.SECRET) {
      result = { ok: false, error: 'unauthorized' };
    } else {
      const raw = CacheService.getScriptCache().get('upload_' + String(p.requestId || ''));
      result = raw ? JSON.parse(raw) : { ok: false, pending: true };
    }
  } else {
    result = { ok: true, message: 'Reimbursement Drive Bridge is running.' };
  }

  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const requestId = String(p.requestId || '');
  const cache = CacheService.getScriptCache();

  try {
    if (p.key !== CONFIG.SECRET) throw new Error('unauthorized');
    if (p.action !== 'uploadPdf') throw new Error('unsupported action');

    const fileName = sanitizeFileName_(p.fileName || '報帳.pdf');
    if (!/\.pdf$/i.test(fileName)) throw new Error('only PDF is allowed');

    const encoded = String(p.base64 || '');
    if (!encoded) throw new Error('missing PDF data');
    if (encoded.length > 18 * 1024 * 1024) throw new Error('PDF too large');

    const year = /^\d{4}$/.test(String(p.year || '')) ? String(p.year) : String(new Date().getFullYear());
    const monthNo = Math.min(12, Math.max(1, Number(p.month || (new Date().getMonth() + 1))));
    const monthFolder = String(monthNo).padStart(2, '0') + '月';
    const target = p.kind === '整批' ? '整批匯出' : '請款PDF';

    const root = ensureFolder_(DriveApp.getRootFolder(), CONFIG.ROOT_FOLDER);
    const yearDir = ensureFolder_(root, year);
    const monthDir = ensureFolder_(yearDir, monthFolder);
    const targetDir = ensureFolder_(monthDir, target);

    const bytes = Utilities.base64Decode(encoded);
    const blob = Utilities.newBlob(bytes, MimeType.PDF, fileName);

    const duplicates = targetDir.getFilesByName(fileName);
    while (duplicates.hasNext()) duplicates.next().setTrashed(true);

    const file = targetDir.createFile(blob);
    const result = {
      ok: true,
      requestId: requestId,
      fileId: file.getId(),
      fileName: file.getName(),
      target: CONFIG.ROOT_FOLDER + '/' + year + '/' + monthFolder + '/' + target,
      url: file.getUrl()
    };

    if (requestId) cache.put('upload_' + requestId, JSON.stringify(result), 600);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    const result = { ok: false, requestId: requestId, error: String(err && err.message ? err.message : err) };
    if (requestId) cache.put('upload_' + requestId, JSON.stringify(result), 600);
    return ContentService.createTextOutput('ERROR');
  }
}

function ensureFolder_(parent, name) {
  const found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}

function sanitizeFileName_(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').slice(0, 160);
}

function safeCallback_(name) {
  return /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(String(name)) ? String(name) : 'callback';
}
