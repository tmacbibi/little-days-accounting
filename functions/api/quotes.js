export async function onRequestGet(context) {
  try {
    const requestUrl = new URL(context.request.url);
    const raw = requestUrl.searchParams.get('channels') || '';
    const channels = raw.split('|').map(s => s.trim()).filter(Boolean);
    const valid = channels.filter(s => /^(?:tse|otc)_[0-9A-Za-z]+\.tw$/.test(s));

    if (!valid.length || valid.length > 30) {
      return new Response(
        JSON.stringify({ error: 'invalid channels', msgArray: [] }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
          }
        }
      );
    }

    const target = new URL(
      'https://mis.twse.com.tw/stock/api/getStockInfo.jsp'
    );
    target.searchParams.set('ex_ch', valid.join('|'));
    target.searchParams.set('_', Date.now().toString());

    const upstream = await fetch(target.toString(), {
      headers: {
        accept: 'application/json,text/plain,*/*',
        referer: 'https://mis.twse.com.tw/stock/fibest.jsp',
        'user-agent': 'Mozilla/5.0'
      },
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'quote proxy failed',
        msgArray: []
      }),
      {
        status: 502,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store'
        }
      }
    );
  }
}
