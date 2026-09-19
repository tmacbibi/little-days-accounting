let token=null;
const SCOPE='https://www.googleapis.com/auth/drive';
const KEY='reimbursement_google_client_id';

export function getClientId(){return localStorage.getItem(KEY)||'';}
export function setClientId(v){v=String(v||'').trim();if(v)localStorage.setItem(KEY,v);else localStorage.removeItem(KEY);}
function loadGIS(){
  if(window.google?.accounts?.oauth2)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;
    s.onload=resolve;s.onerror=()=>reject(new Error('無法載入 Google 登入元件'));document.head.appendChild(s);
  });
}
export async function connectDrive(){
  const clientId=getClientId();if(!clientId)throw new Error('尚未設定 Google OAuth Client ID');
  await loadGIS();
  return new Promise((resolve,reject)=>{
    const c=google.accounts.oauth2.initTokenClient({
      client_id:clientId,scope:SCOPE,
      callback:r=>{if(r.error)reject(new Error(r.error));else{token=r.access_token;resolve(token);}}
    });
    c.requestAccessToken({prompt:token?'':'consent'});
  });
}
async function auth(){if(!token)await connectDrive();return token;}
async function api(path,opt={}){
  const t=await auth();
  const res=await fetch('https://www.googleapis.com'+path,{...opt,headers:{...(opt.headers||{}),Authorization:'Bearer '+t}});
  if(res.status===401){token=null;return api(path,opt);}
  if(!res.ok)throw new Error('Google Drive '+res.status+' '+await res.text());
  return res;
}
function esc(s){return String(s).replace(/'/g,"\\'");}
async function findFolder(name,parent='root'){
  const q="name = '"+esc(name)+"' and mimeType = 'application/vnd.google-apps.folder' and '"+esc(parent)+"' in parents and trashed = false";
  const r=await api('/drive/v3/files?spaces=drive&fields=files(id,name)&q='+encodeURIComponent(q));
  const j=await r.json();return j.files?.[0]||null;
}
async function createFolder(name,parent='root'){
  const r=await api('/drive/v3/files?fields=id,name',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[parent]})});
  return r.json();
}
async function ensureFolder(name,parent='root'){return (await findFolder(name,parent))||createFolder(name,parent);}
async function ensurePath(parts){let p='root';for(const name of parts){const f=await ensureFolder(name,p);p=f.id;}return p;}
async function findFile(name,parentId){
  const q="name = '"+esc(name)+"' and '"+esc(parentId)+"' in parents and trashed = false";
  const r=await api('/drive/v3/files?spaces=drive&fields=files(id,name,webViewLink)&q='+encodeURIComponent(q));
  const j=await r.json();return j.files?.[0]||null;
}
async function uploadBlob(blob,name,parentId){
  const boundary='-------reimburse'+Date.now();
  const meta=JSON.stringify({name,parents:[parentId]});
  const body=new Blob([
    '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n',
    '--'+boundary+'\r\nContent-Type: application/pdf\r\n\r\n',blob,'\r\n--'+boundary+'--'
  ],{type:'multipart/related; boundary='+boundary});
  const existing=await findFile(name,parentId);
  const path=existing
    ? '/upload/drive/v3/files/'+existing.id+'?uploadType=multipart&fields=id,name,webViewLink'
    : '/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  const r=await api(path,{
    method:existing?'PATCH':'POST',
    headers:{'Content-Type':'multipart/related; boundary='+boundary},body
  });
  return r.json();
}
export async function uploadBatchPdfs(files,date=new Date()){
  await auth();
  const yyyy=String(date.getFullYear());
  const mm=String(date.getMonth()+1).padStart(2,'0')+'月';
  const pdfFolder=await ensurePath(['報帳系統',yyyy,mm,'請款PDF']);
  const exportFolder=await ensurePath(['報帳系統',yyyy,mm,'整批匯出']);
  const results=[];
  for(const f of files)results.push(await uploadBlob(f.blob,f.name,f.kind==='整批'?exportFolder:pdfFolder));
  return results;
}