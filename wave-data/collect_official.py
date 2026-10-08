import csv,json,hashlib,re,datetime
from pathlib import Path
import subprocess, tempfile, concurrent.futures, calendar
root=Path(tempfile.mkdtemp(prefix='wave-official-'))
repo=Path(__file__).resolve().parent
url='https://www.tpex.org.tw/web/stock/aftertrading/DAILY_CLOSE_quotes/stk_quote_result.php?l=zh-tw&o=data'
def fetch(url,path):
 r=subprocess.run(['curl','--fail','--location','--max-redirs','2','--silent','--show-error','--max-time','45',url,'-o',str(path)],capture_output=True,text=True)
 if r.returncode:raise RuntimeError('Official download failed: '+url)
fetch(url,root/'quotes.csv')
def date(s):
 a=re.findall(r'\d+',str(s))
 if len(a)==1:
  s=a[0]
  if len(s)==7:return f'{int(s[:3])+1911}-{s[3:5]}-{s[5:]}'
  if len(s)==8:return f'{s[:4]}-{s[4:6]}-{s[6:]}'
 if len(a)>=3:return f'{int(a[0])+1911 if int(a[0])<1911 else int(a[0])}-{int(a[1]):02}-{int(a[2]):02}'
 return ''
def n(v):
 try:return float(str(v).replace(',',''))
 except:return None
quotes=[]
for r in csv.DictReader(open(root/'quotes.csv',encoding='utf-8-sig')):
 if not re.fullmatch(r'\d{4}',r['代號']) or r['代號'].startswith('00'):continue
 if not n(r['收盤']) or not n(r['開盤']):continue
 q={'code':r['代號'],'name':r['名稱'],'market':'TWO','date':date(r['資料日期'])}
 for key,col in [('close','收盤'),('change','漲跌'),('volume','成交股數'),('amount','成交金額'),('open','開盤'),('high','最高'),('low','最低')]:q[key]=n(r[col])
 quotes.append(q)
assert len(quotes)>700
sessions={q['date'] for q in quotes};assert len(sessions)==1
as_of=sessions.pop();day=datetime.date.fromisoformat(as_of)
assert day<=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date()
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
raw={k:json.loads((root/(k+'.json')).read_text()) for k in ['attention','warning','disposal','actions']}
for k in ['attention','warning','disposal']:assert max(date(r['Date']) for r in raw[k])==as_of
d=raw['actions'];assert d['stat'].lower()=='ok' and d['date']==start.strftime('%Y%m%d')+'~'+day.strftime('%Y%m%d') and d['tables'][0]['totalCount']==len(d['tables'][0]['data'])
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
 else:raise RuntimeError('History did not align with official quote')
data['history']=short
out=repo/'latest.json';old=json.loads(out.read_text()) if out.exists() else {}
assert old.get('asOf','')<=as_of,'Refuse to replace newer data'
tmp=repo/'latest.tmp';tmp.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')));tmp.replace(out)
print(json.dumps({'date':data['asOf'],'quotes':len(quotes),'attention':len(data['risk']['attention']),'warning':len(data['risk']['warning']),'disposal':len(disposal),'actions':len(events)},ensure_ascii=False))
