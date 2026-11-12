import csv,json,hashlib,re,datetime,math,shutil
from pathlib import Path
import tempfile, concurrent.futures, calendar
repo=Path(__file__).resolve().parent
url='https://www.tpex.org.tw/web/stock/aftertrading/DAILY_CLOSE_quotes/stk_quote_result.php?l=zh-tw&o=data'
from collector_io import fetch, validate_risk_rows, publish_bundle, run_collection
def date(s):
 a=re.findall(r'\d+',str(s))
 if len(a)==1 and len(a[0]) in (7,8):
  value=a[0]; width=3 if len(value)==7 else 4
  a=[value[:width],value[width:width+2],value[width+2:]]
 if len(a)!=3:raise ValueError('Invalid official date: '+str(s))
 year=int(a[0])+1911 if len(a[0])==3 else int(a[0])
 return datetime.date(year,int(a[1]),int(a[2])).isoformat()
def n(v):
 try:
  value=float(str(v).replace(',',''))
  return value if math.isfinite(value) else None
 except (TypeError,ValueError):return None
def collect():
 root=Path(tempfile.mkdtemp(prefix='wave-official-'))
 try:
  fetch(url,root/'quotes.csv')
  quotes=[]
  with open(root/'quotes.csv',encoding='utf-8-sig') as source:
   rows=list(csv.DictReader(source))
  for r in rows:
   if not re.fullmatch(r'\d{4}',r['代號']) or r['代號'].startswith('00'):continue
   if not n(r['收盤']) or not n(r['開盤']):continue
   q={'code':r['代號'],'name':r['名稱'],'market':'TWO','date':date(r['資料日期'])}
   for key,col in [('close','收盤'),('change','漲跌'),('volume','成交股數'),('amount','成交金額'),('open','開盤'),('high','最高'),('low','最低')]:q[key]=n(r[col])
   quotes.append(q)
  assert len(quotes)>700,'quotes: incomplete official snapshot'
  sessions={q['date'] for q in quotes};assert len(sessions)==1,'quotes: mixed source dates'
  as_of=sessions.pop();day=datetime.date.fromisoformat(as_of)
  assert day<=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date(),'quotes: future source date'
  month=day.month-6;year=day.year
  if month<=0:month+=12;year-=1
  start=day.replace(year=year,month=month,day=min(day.day,calendar.monthrange(year,month)[1]))-datetime.timedelta(days=14)
  urls={
   'attention':'https://www.tpex.org.tw/openapi/v1/tpex_trading_warning_information',
   'warning':'https://www.tpex.org.tw/openapi/v1/tpex_trading_warning_note',
   'disposal':'https://www.tpex.org.tw/openapi/v1/tpex_disposal_information',
   'actions':f"https://www.tpex.org.tw/www/zh-tw/bulletin/exDailyQ?startDate={start.strftime('%Y/%m/%d')}&endDate={day.strftime('%Y/%m/%d')}&response=json"}
  with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
   list(pool.map(lambda item:fetch(item[1],root/(item[0]+'.json')),urls.items()))
  (root/'provenance.json').write_text(json.dumps({'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'urls':urls}))
  raw={}
  for k in ['attention','warning','disposal','actions']:
   try:raw[k]=json.loads((root/(k+'.json')).read_text())
   except (ValueError,UnicodeError) as error:raise ValueError(f'{k}: invalid official JSON') from error
  validate_risk_rows(raw,as_of,date)
  d=raw['actions'];assert d['stat'].lower()=='ok' and d['date']==start.strftime('%Y%m%d')+'~'+day.strftime('%Y%m%d') and d['tables'][0]['totalCount']==len(d['tables'][0]['data']),'actions: status, coverage range, or row count mismatch'
  events=[{'code':r[1],'date':date(r[0]),'factor':n(r[4])/n(r[3]),'kind':r[8]} for r in d['tables'][0]['data'] if n(r[3]) and n(r[4])]
  disposal=[]
  for r in raw['disposal']:
   p=re.findall(r'\d{3}/\d{1,2}/\d{1,2}|\d{7}',r['DispositionPeriod']);assert len(p)==2
   disposal.append({'code':r['SecuritiesCompanyCode'],'start':date(p[0]),'end':date(p[1])})
  provenance=json.loads((root/'provenance.json').read_text());provenance['urls']['quotes']='https://www.tpex.org.tw/web/stock/aftertrading/DAILY_CLOSE_quotes/stk_quote_result.php?l=zh-tw&o=data';provenance['hashes']={k:hashlib.sha256((root/'quotes.csv' if k=='quotes' else root/(k+'.json')).read_bytes()).hexdigest() for k in provenance['urls']}
  data={'asOf':as_of,'provenance':provenance,'quotes':quotes,'risk':{'verified':True,'asOf':as_of,'attention':[r['SecuritiesCompanyCode'] for r in raw['attention'] if date(r['Date'])==as_of],'warning':[r['SecuritiesCompanyCode'] for r in raw['warning'] if date(r['Date'])==as_of],'disposal':disposal,'sources':[provenance['urls'][k] for k in ['attention','warning','disposal']],'backup':True},'actions':{'verified':True,'fromDate':start.isoformat(),'asOf':as_of,'events':events,'source':'櫃買中心除權除息計算結果表（官方資料轉存）','backup':True}}
  # Download short official histories for recent listings; insufficient history stays ineligible.
  short={}
  for q in quotes:
   if q['code']!='7856':continue
   bars=[]
   for offset in range(7):
    ym=day.year*12+day.month-1-offset;y,m=divmod(ym,12);m+=1
    u=f"https://www.tpex.org.tw/www/zh-tw/afterTrading/tradingStock?code={q['code']}&date={y}/{m:02}/01&response=json"
    p=root/f"history-{q['code']}-{offset}.json";fetch(u,p)
    h=json.loads(p.read_text());rows=h.get('tables',[{}])[0].get('data',[]) if h.get('tables') else []
    for r in rows:
     if not all(n(r[i]) for i in [3,4,5,6]):continue
     bars.append({'date':date(r[0]),'open':n(r[3]),'high':n(r[4]),'low':n(r[5]),'close':n(r[6]),'volume':n(r[1])*1000})
   bars=sorted({b['date']:b for b in bars if b['date']<=as_of}.values(),key=lambda b:b['date'])
   if bars and bars[-1]['date']==as_of and abs(bars[-1]['close']-q['close'])<0.01:short[q['code']]=bars
   else:raise RuntimeError(f"history {q['code']}: did not align with official quote {as_of}")
  data['history']=short
  changed=publish_bundle(repo/'latest.json',data)
  return {'asOf':data['asOf'],'changed':changed,'quotes':len(quotes),'attention':len(data['risk']['attention']),'warning':len(data['risk']['warning']),'disposal':len(disposal),'actions':len(events)}
 finally:
  shutil.rmtree(root)

if __name__=='__main__':
 print(json.dumps(run_collection(collect,repo),ensure_ascii=False))
