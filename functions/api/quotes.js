// V1.4.11：小日子台股資料同源 API。
// mode=master&symbol=0050：查單一證券中文名稱／市場／類型／最新收盤。
// mode=snapshot&symbols=0050,00919：一次查多檔最新正式收盤；前端再以 symbol+marketDate 快取。
// mode=live&channels=tse_0050.tw|...：best-effort 盤中行情。

export async function onRequestGet(context) {
  const u = new URL(context.request.url);
  const mode = (u.searchParams.get('mode') || '').toLowerCase();
  try {
    if (mode === 'master') return await handleMaster(u);
    if (mode === 'snapshot') return await handleSnapshot(u);
    if (mode === 'live' || u.searchParams.has('channels')) return await handleLive(u);
    return json({ error: 'invalid mode' }, 400);
  } catch (error) {
    return json({ error: 'market api failed', message: String(error?.message || error) }, 502);
  }
}

async function handleMaster(u) {
  const symbol = normSymbol(u.searchParams.get('symbol'));
  if (!symbol) return json({ error: 'invalid symbol' }, 400);
  const rows = await loadOfficialSnapshots();
  const item = rows.find(x => x.symbol === symbol);
  if (!item) return json({ found: false, symbol }, 404);
  return json({ found: true, ...item }, 200, 21600);
}

async function handleSnapshot(u) {
  const symbols = String(u.searchParams.get('symbols') || '')
    .split(',').map(normSymbol).filter(Boolean);
  const unique = [...new Set(symbols)].slice(0, 30);
  if (!unique.length) return json({ error: 'invalid symbols', items: [] }, 400);
  const wanted = new Set(unique);
  const rows = await loadOfficialSnapshots();
  const items = rows.filter(x => wanted.has(x.symbol));
  return json({ items, requested: unique.length, found: items.length }, 200, 120);
}

async function loadOfficialSnapshots() {
  // 由 Cloudflare server 端抓官方資料，避免 iPhone PWA CORS / 大型 payload 問題。
  const [twse, tpex] = await Promise.allSettled([
    fetchJson('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', 12000, 120),
    fetchJson('https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes', 12000, 120)
  ]);
  const out = [];
  if (twse.status === 'fulfilled') {
    for (const r of Array.isArray(twse.value) ? twse.value : []) {
      const symbol = normSymbol(r.Code || r['證券代號']);
      const name = clean(r.Name || r['證券名稱']);
      const date = rocToIso(r.Date || r['日期']);
      const close = num(r.ClosingPrice || r['收盤價']);
      if (symbol && name) out.push({ symbol, name, market: 'TWSE', securityType: guessType(symbol, name), date, close });
    }
  }
  if (tpex.status === 'fulfilled') {
    for (const r of Array.isArray(tpex.value) ? tpex.value : []) {
      const symbol = normSymbol(r.SecuritiesCompanyCode || r.Code || r['證券代號']);
      const name = clean(r.CompanyName || r.SecuritiesCompanyName || r.SecuritiesName || r.Name || r['證券名稱']);
      const date = rocToIso(r.Date || r['日期']);
      const close = num(r.Close || r['收盤'] || r['收盤價']);
      if (symbol && name) out.push({ symbol, name, market: 'TPEx', securityType: guessType(symbol, name), date, close });
    }
  }
  if (!out.length) {
    const reasons = [twse, tpex].filter(x => x.status === 'rejected').map(x => String(x.reason?.message || x.reason));
    throw new Error(`official snapshots unavailable${reasons.length ? `: ${reasons.join(' / ')}` : ''}`);
  }
  return out;
}

async function handleLive(u) {
  const raw = u.searchParams.get('channels') || '';
  const channels = raw.split('|').map(s => s.trim()).filter(Boolean);
  const valid = channels.filter(s => /^(?:tse|otc)_[0-9A-Za-z]+\.tw$/.test(s));
  if (!valid.length || valid.length > 30) return json({ error: 'invalid channels', msgArray: [] }, 400);

  let cookie = '';
  try {
    const firstSymbol = valid[0].split('_')[1].split('.')[0];
    const warm = await fetch(`https://mis.twse.com.tw/stock/fibest.jsp?stock=${encodeURIComponent(firstSymbol)}`, {
      headers: { accept: 'text/html,*/*', 'user-agent': 'Mozilla/5.0' }, redirect: 'follow'
    });
    const setCookie = warm.headers.get('set-cookie') || '';
    const matches = setCookie.match(/(?:JSESSIONID|BIGipServer[^=]*)=[^;,]+/g);
    if (matches?.length) cookie = matches.join('; ');
  } catch (_) {}

  const target = new URL('https://mis.twse.com.tw/stock/api/getStockInfo.jsp');
  target.searchParams.set('ex_ch', valid.join('|'));
  target.searchParams.set('json', '1');
  target.searchParams.set('delay', '0');
  target.searchParams.set('_', Date.now().toString());
  const headers = { accept: 'application/json,text/plain,*/*', referer: 'https://mis.twse.com.tw/stock/fibest.jsp', 'user-agent': 'Mozilla/5.0' };
  if (cookie) headers.cookie = cookie;
  const upstream = await fetch(target.toString(), { headers, cf: { cacheTtl: 0, cacheEverything: false } });
  const body = await upstream.text();
  return new Response(body, { status: upstream.status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, max-age=0' } });
}

async function fetchJson(url, timeoutMs = 12000, cacheTtl = 0) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json,text/plain,*/*', 'user-agent': 'Mozilla/5.0' },
      cf: cacheTtl ? { cacheTtl, cacheEverything: true } : { cacheTtl: 0, cacheEverything: false }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(timer); }
}

function normSymbol(v) { return String(v || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, ''); }
function clean(v) { return String(v || '').trim(); }
function num(v) { const n = Number(String(v ?? '').replace(/,/g, '').trim()); return Number.isFinite(n) && n > 0 ? n : 0; }
function rocToIso(v) {
  const s = String(v || '').replace(/\D/g, '');
  if (s.length === 7) return `${Number(s.slice(0,3)) + 1911}-${s.slice(3,5)}-${s.slice(5,7)}`;
  if (s.length === 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
  return '';
}
function guessType(symbol, name) {
  const text = `${symbol} ${name}`;
  if (/債|B$/.test(text)) return 'bond-etf';
  if (/ETF|基金|^00/.test(text)) return 'etf';
  return 'stock';
}
function json(data, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': maxAge ? `public, max-age=${maxAge}` : 'no-store, max-age=0'
    }
  });
}
