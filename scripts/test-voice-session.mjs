import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const nodes=new Map(),timers=new Map(),instances=[];let nextTimer=0;
function node(){const classes=new Set(['hidden']);return {value:'',textContent:'',classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v)},focus(){},style:{}};}
function getNode(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);}
class Recognition{
 constructor(){instances.push(this);this.starts=0;this.aborts=0;}
 start(){if(this.starts)throw new Error('engine cannot be reused');this.starts++;if(this.throwOnStart||Recognition.fail)throw new Error('start failed');if(!Recognition.silent)this.onstart?.();}
 abort(){this.aborts++;}
 result(text,final=true){const r=[{transcript:text}];r.isFinal=final;this.onresult?.({resultIndex:0,results:[r]});}
}
const sandbox={console:{warn(){}},structuredClone,TextEncoder,TextDecoder,Date,Blob,URL,AbortController,crypto:globalThis.crypto,navigator:{},window:{webkitSpeechRecognition:Recognition,addEventListener(){}},document:{getElementById:getNode,addEventListener(){},querySelectorAll(){return[];}},localStorage:{getItem(){return null;}},setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
run(`unlocked=true;selectedDate='2026-10-02';globalThis.parsed=[];applyParsedVoice=(item,text)=>{parsed.push({item,text});closeVoiceSheet(false);};toast=()=>{};`);
// First, second and third independent accounting entries use fresh engines.
let staleEnd,staleResult;
for(const [index,text] of ['午餐100元','停車200元','充電300元'].entries()){
 run('openVoiceSheet()');const rec=instances.at(-1);assert.equal(rec.starts,1);
 if(index===0){staleEnd=rec.onend;staleResult=rec.onresult;}
 if(index===1){staleEnd();const r=[{transcript:'過期999元'}];r.isFinal=true;staleResult({resultIndex:0,results:[r]});assert.equal(instances.at(-1),rec);}
 rec.result(text);run('finishVoice()');assert.equal(rec.aborts,1);assert.equal(run('recognition'),null);assert.equal(run('voiceSessionActive'),false);assert.equal(timers.size,0);
}
assert.deepEqual(JSON.parse(JSON.stringify(run('parsed.map(x=>x.item.amount)'))),[100,200,300]);
assert.equal(run('parsed[1].text'),'停車200元');
// A pending restart from the first session must not start the second engine.
run('openVoiceSheet()');const disconnected=instances.at(-1);disconnected.result('午餐50元');disconnected.onend();const oldTimer=[...timers.values()].find(t=>t.ms===220).fn;
run('closeVoiceSheet();openVoiceSheet()');const replacement=instances.at(-1),count=instances.length;oldTimer();assert.equal(instances.length,count);assert.equal(run('recognition'),replacement);
run('closeVoiceSheet()');assert.equal(timers.size,0);
// Browser disconnection reconnects with a fresh engine and retains the phrase.
run('openVoiceSheet()');instances.at(-1).result('午餐100元',false);instances.at(-1).onend();const restart=[...timers.entries()].find(([,t])=>t.ms===220);timers.delete(restart[0]);restart[1].fn();assert.equal(instances.at(-1).starts,1);assert.equal(run('voiceAccumulated'),'午餐100元');run('closeVoiceSheet()');
// Cancelled callbacks and microphone permission errors cannot poison the next run.
run('openVoiceSheet()');instances.at(-1).result('咖啡80元');instances.at(-1).onerror({error:'not-allowed'});assert.equal(run('voiceSessionActive'),false);assert.equal(getNode('voiceFallbackInput').value,'咖啡80元');assert.equal(getNode('voiceFallbackInput').classList.contains('hidden'),false);assert.equal(timers.size,0);
run('closeVoiceSheet();openVoiceSheet()');assert.equal(getNode('voiceFallbackInput').value,'');instances.at(-1).result('停車60元');run('finishVoice()');assert.equal(run('parsed.at(-1).item.amount'),60);
Recognition.fail=true;run('openVoiceSheet()');assert.equal(run('recognition'),null);assert.equal(timers.size,0);assert.equal(getNode('voiceFallbackInput').classList.contains('hidden'),false);Recognition.fail=false;
// Finish with no transcript still provides a usable input instead of a dead orb.
run('openVoiceSheet();finishVoice()');assert.equal(run('voiceSessionActive'),false);assert.equal(getNode('voiceFallbackInput').classList.contains('hidden'),false);
Recognition.silent=true;run('openVoiceSheet()');const watchdog=[...timers.entries()].find(([,t])=>t.ms===7000);timers.delete(watchdog[0]);watchdog[1].fn();assert.equal(run('voiceSessionActive'),false);assert.equal(run('recognition'),null);assert.equal(getNode('voiceFallbackInput').classList.contains('hidden'),false);Recognition.silent=false;
console.log('voice lifecycle tests passed: three entries, stale events/timers, reconnect, cancel/reopen, failure recovery, fallback');
