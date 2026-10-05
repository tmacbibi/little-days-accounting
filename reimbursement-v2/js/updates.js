import { APP_VERSION } from './rules.js';

function waitForActivation(worker) {
  if (!worker || worker.state === 'activated') return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(new Error('更新尚未完成，請稍後再試')),30000);
    function finish(error) { clearTimeout(timer); worker.removeEventListener('statechange',changed); error?reject(error):resolve(); }
    function changed() {
      if(worker.state==='activated') finish();
      else if(worker.state==='redundant') finish(new Error('新版下載失敗，請稍後再試'));
    }
    worker.addEventListener('statechange',changed);
    changed();
  });
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-check-update]');
  if(!button || button.disabled) return;
  button.disabled=true;
  button.textContent='檢查中…';
  try {
    if(!navigator.onLine) throw new Error('目前離線，請連上網路後再檢查');
    const response=await fetch(new URL('../version.json',import.meta.url),{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok) throw new Error('無法取得版本資訊');
    const latest=await response.json();
    if(!latest.version) throw new Error('版本資訊不完整');
    if(latest.version===APP_VERSION) {
      alert('目前已是最新版本 V'+APP_VERSION);
      return;
    }
    if(!('serviceWorker' in navigator)) throw new Error('此瀏覽器不支援自動更新，請重新開啟網頁');
    button.textContent='下載新版…';
    const registration=await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{updateViaCache:'none'});
    await registration.update();
    await waitForActivation(registration.installing || registration.waiting || registration.active);
    if(confirm('新版 V'+latest.version+' 已準備好，現在重新載入？未儲存的輸入將不會保留。')) location.reload();
  } catch(error) {
    alert('檢查更新失敗：'+error.message);
  } finally {
    button.disabled=false;
    button.textContent='檢查更新';
  }
});
