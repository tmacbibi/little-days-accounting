const URL_KEY='reimbursement_apps_script_url';
const KEY_KEY='reimbursement_bridge_key';

export function getBridgeUrl(){return localStorage.getItem(URL_KEY)||'';}
export function setBridgeUrl(v){v=String(v||'').trim();if(v)localStorage.setItem(URL_KEY,v);else localStorage.removeItem(URL_KEY);}
export function getBridgeKey(){return localStorage.getItem(KEY_KEY)||'';}
export function setBridgeKey(v){v=String(v||'').trim();if(v)localStorage.setItem(KEY_KEY,v);else localStorage.removeItem(KEY_KEY);}

function jsonp(url, timeout=10000){
  return new Promise((resolve,reject)=>{
    const cb='__bridge_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const s=document.createElement('script');
    const timer=setTimeout(()=>{cleanup();reject(new Error('Apps Script 回應逾時'));},timeout);
    function cleanup(){clearTimeout(timer);delete window[cb];s.remove();}
    window[cb]=data=>{cleanup();resolve(data);};
    s.onerror=()=>{cleanup();reject(new Error('無法連線 Apps Script'));};
    const sep=url.includes('?')?'&':'?';
    s.src=url+sep+'callback='+encodeURIComponent(cb);
    document.head.appendChild(s);
  });
}

export async function testBridge(){
  const url=getBridgeUrl(),key=getBridgeKey();
  if(!url)throw new Error('尚未設定 Apps Script Web App URL');
  if(!key)throw new Error('尚未設定 Bridge Key');
  const sep=url.includes('?')?'&':'?';
  const r=await jsonp(url+sep+'mode=ping&key='+encodeURIComponent(key));
  if(!r?.ok)throw new Error('Bridge Key 不正確，或 Apps Script 尚未完成部署');
  return r;
}

function blobToBase64(blob){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result).split(',')[1]||'');
    r.onerror=()=>reject(r.error||new Error('PDF 轉換失敗'));
    r.readAsDataURL(blob);
  });
}

async function pollStatus(requestId){
  const url=getBridgeUrl(),key=getBridgeKey();
  const sep=url.includes('?')?'&':'?';
  for(let i=0;i<15;i++){
    await new Promise(r=>setTimeout(r,i===0?900:700));
    const res=await jsonp(url+sep+'mode=status&key='+encodeURIComponent(key)+'&requestId='+encodeURIComponent(requestId));
    if(res?.ok)return res;
    if(res && !res.pending)throw new Error(res.error||'Apps Script 上傳失敗');
  }
  throw new Error('Google Drive 上傳確認逾時');
}

async function uploadOne(file, date){
  const url=getBridgeUrl(),key=getBridgeKey();
  const requestId=(crypto.randomUUID?crypto.randomUUID():Date.now()+'_'+Math.random().toString(36).slice(2));
  const body=new URLSearchParams();
  body.set('action','uploadPdf');
  body.set('key',key);
  body.set('requestId',requestId);
  body.set('fileName',file.name);
  body.set('kind',file.kind);
  body.set('year',String(date.getFullYear()));
  body.set('month',String(date.getMonth()+1));
  body.set('base64',await blobToBase64(file.blob));

  await fetch(url,{
    method:'POST',
    mode:'no-cors',
    headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body
  });
  return pollStatus(requestId);
}

export async function uploadBatchPdfs(files,date=new Date(),onProgress=()=>{}){
  await testBridge();
  const out=[];
  for(let i=0;i<files.length;i++){
    onProgress(i,files.length,files[i]);
    out.push(await uploadOne(files[i],date));
  }
  return out;
}
