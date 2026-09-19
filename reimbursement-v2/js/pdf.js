const PW=595.3, PH=841.9, SCALE=2.78, CW=Math.round(PW*SCALE), CH=Math.round(PH*SCALE);
const FONT='"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
const PROFILE={department:'C',employeeNo:'530',applicant:'江孝頤'};

const px=v=>v*SCALE;
function roc(date){
  const d=new Date((date||new Date().toISOString().slice(0,10))+'T00:00:00');
  return [d.getFullYear()-1911,d.getMonth()+1,d.getDate()];
}
function fmt(n){return Math.round(Number(n||0)).toLocaleString('zh-TW');}
function page(){
  const c=document.createElement('canvas');c.width=CW;c.height=CH;
  const x=c.getContext('2d');x.scale(SCALE,SCALE);x.fillStyle='#fff';x.fillRect(0,0,PW,PH);
  x.strokeStyle='#111';x.fillStyle='#111';x.lineWidth=.7;x.lineCap='butt';
  return [c,x];
}
function txt(x,s,a,b,size=10,align='left',bold=false){
  x.save();x.font=`${bold?'700':'400'} ${size}px ${FONT}`;x.textAlign=align;x.textBaseline='middle';x.fillStyle='#111';
  x.fillText(String(s??''),a,b);x.restore();
}
function line(x,x1,y1,x2,y2,w=.7,dash=[]){x.save();x.lineWidth=w;x.setLineDash(dash);x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();x.restore();}
function rect(x,a,b,w,h,lw=.7){x.save();x.lineWidth=lw;x.strokeRect(a,b,w,h);x.restore();}
function fitTxt(x,s,cx,cy,maxW,size=10,align='center',bold=false){
  let z=size; x.save();
  while(z>6){x.font=`${bold?'700':'400'} ${z}px ${FONT}`;if(x.measureText(String(s||'')).width<=maxW)break;z-=.5;}
  x.textAlign=align;x.textBaseline='middle';x.fillStyle='#111';x.fillText(String(s||''),cx,cy);x.restore();
}
function wrap(x,s,maxW,size=9,maxLines=2){
  x.save();x.font=`400 ${size}px ${FONT}`;const out=[];let cur='';
  for(const ch of String(s||'')){const n=cur+ch;if(x.measureText(n).width>maxW&&cur){out.push(cur);cur=ch;if(out.length===maxLines-1)break;}else cur=n;}
  if(cur&&out.length<maxLines)out.push(cur);x.restore();return out;
}
function company(x,y,title){
  txt(x,'鼎漢國際工程顧問股份有限公司',PW/2,y,12,'center');
  txt(x,title,PW/2,y+18,13,'center');
}
function cut(x,y){txt(x,'✂',36,y,11,'center');line(x,60,y,530,y,.55,[3,2]);}
function profile(x,y,third=false){
  txt(x,`部門代號：${PROFILE.department}`,70,y,9);
  txt(x,`員工編號：${PROFILE.employeeNo}`,170,y,9);
  txt(x,`申請人：${PROFILE.applicant}`,300,y,9);
}
function signatures(x,tableTop,kind='normal',slot=0){
  txt(x,'總經理',520,tableTop+20,10);
  txt(x,'部門主管',520,tableTop+62,10);
  txt(x,'專案經理',520,tableTop+101,10);
}

const GENERAL_X=[67.7,91.6,118.9,146.2,261.9,325.7,371.2,425.8,508.5];
const GENERAL_TOP=[87.6,350.2,608.7];
function generalFrame(x,slot){
  const t=GENERAL_TOP[slot], yTitle=t-57;
  company(x,yTitle,'請  款  單');
  txt(x,'☑一般請款     □請暫付款(需款日：__月__日)',68,t-25,9.5);
  txt(x,'□廠商請款(付款方式□月結□現金)',68,t-11,9.5);
  const ys=[t,t+21.1,t+41.9,t+62.6,t+83.4,t+104.1,t+125.3];
  line(x,GENERAL_X[0],ys[0],GENERAL_X.at(-1),ys[0],1);
  line(x,GENERAL_X[0],ys.at(-1),GENERAL_X.at(-1),ys.at(-1),1);
  GENERAL_X.forEach(xx=>line(x,xx,ys[0],xx,ys.at(-1),.7));
  ys.slice(1,-1).forEach(yy=>line(x,GENERAL_X[0],yy,GENERAL_X.at(-1),yy,.7));
  ['年','月','日','摘    要','專案代號','數量','單價','金 額'].forEach((s,i)=>txt(x,s,(GENERAL_X[i]+GENERAL_X[i+1])/2,t+10.5,9.5,'center'));
  txt(x,'總        計',196.5,t+114.7,10,'center');
  signatures(x,t,'general',slot);
  profile(x,t+137);
  txt(x,'實領金額：',68,t+152,8.8);
  txt(x,'暫付款沖銷金額：',170,t+152,8.8);
  if(slot<2)cut(x,slot===0?269:529.4);
}
function fillGeneral(x,e,slot){
  generalFrame(x,slot); if(!e)return;
  const t=GENERAL_TOP[slot], ys=[t,t+21.1,t+41.9,t+62.6,t+83.4,t+104.1,t+125.3];
  const [yy,mm,dd]=roc(e.date), rows=(e.computed?.generalRows||[]).slice(0,4);
  rows.forEach((r,i)=>{
    const cy=(ys[i+1]+ys[i+2])/2;
    txt(x,yy,(GENERAL_X[0]+GENERAL_X[1])/2,cy,8.5,'center');txt(x,mm,(GENERAL_X[1]+GENERAL_X[2])/2,cy,8.5,'center');txt(x,dd,(GENERAL_X[2]+GENERAL_X[3])/2,cy,8.5,'center');
    const ls=wrap(x,r.summary,GENERAL_X[4]-GENERAL_X[3]-8,8.3,2);
    ls.forEach((s,j)=>txt(x,s,GENERAL_X[3]+3,cy+(j-(ls.length-1)/2)*9,8.3));
    fitTxt(x,e.projectCode||'',(GENERAL_X[4]+GENERAL_X[5])/2,cy,GENERAL_X[5]-GENERAL_X[4]-5,8.5);
    txt(x,fmt(r.amount),(GENERAL_X[7]+GENERAL_X[8])/2,cy,8.5,'center');
  });
  txt(x,fmt(e.computed?.generalAmount||0),(GENERAL_X[7]+GENERAL_X[8])/2,(ys[5]+ys[6])/2,8.8,'center');
}

const TRAVEL_X=[44.8,66.7,89.4,112.1,197.1,259.5,310.5,361.6,412.6,463.7,514.0];
const TRAVEL_TOP=[54.8,308.6,568.3];
function travelFrame(x,slot){
  const t=TRAVEL_TOP[slot];company(x,t-31,'國內出差費申請單');
  const ys=[t,t+23.1,t+45.9,t+68.6,t+91.4,t+114.1,t+137.3];
  line(x,TRAVEL_X[0],ys[0],TRAVEL_X.at(-1),ys[0],1);line(x,TRAVEL_X[0],ys.at(-1),TRAVEL_X.at(-1),ys.at(-1),1);
  TRAVEL_X.forEach(xx=>line(x,xx,ys[0],xx,ys.at(-1),.7));ys.slice(1,-1).forEach(yy=>line(x,TRAVEL_X[0],yy,TRAVEL_X.at(-1),yy,.7));
  ['年','月','日','起訖地點','專案代號','交通費','膳 費','宿 費','其 他','小 計'].forEach((s,i)=>txt(x,s,(TRAVEL_X[i]+TRAVEL_X[i+1])/2,t+11.5,9.3,'center'));
  txt(x,'總        計',155,t+125.7,10,'center');signatures(x,t,'travel',slot);profile(x,t+149);
  txt(x,'實領金額：',46,t+166,8.8);txt(x,'暫付款沖銷金額(機票等)：',142,t+166,8.8);
  if(slot<2)cut(x,slot===0?266.5:522.5);
}
function fillTravel(x,e,slot){
  travelFrame(x,slot);if(!e)return;
  const t=TRAVEL_TOP[slot],ys=[t,t+23.1,t+45.9,t+68.6,t+91.4,t+114.1,t+137.3],cy=(ys[1]+ys[2])/2,c=e.computed||{};
  const [yy,mm,dd]=roc(e.date);
  const vals=[yy,mm,dd,e.route||'',e.projectCode||'',fmt(c.travelTraffic),fmt(c.fixedMeal),fmt(c.travelLodging),fmt(c.travelOther),fmt(c.travelTotal)];
  vals.forEach((v,i)=>fitTxt(x,v,(TRAVEL_X[i]+TRAVEL_X[i+1])/2,cy,TRAVEL_X[i+1]-TRAVEL_X[i]-4,8.4));
  txt(x,fmt(c.travelTotal),(TRAVEL_X[9]+TRAVEL_X[10])/2,(ys[5]+ys[6])/2,8.8,'center');
}

const NO_X=[70.2,97.9,126.2,154.6,319.0,381.4,499.8];
const NO_TOP=[72.8,327.7,586.2];
function noFrame(x,slot){
  const t=NO_TOP[slot];company(x,t-31,'無外來憑證支出證明單');
  const ys=[t,t+23.1,t+45.8,t+68.6,t+91.3,t+114.1,t+137.2];
  line(x,NO_X[0],ys[0],NO_X.at(-1),ys[0],1);line(x,NO_X[0],ys.at(-1),NO_X.at(-1),ys.at(-1),1);
  NO_X.forEach(xx=>line(x,xx,ys[0],xx,ys.at(-1),.7));ys.slice(1,-1).forEach(yy=>line(x,NO_X[0],yy,NO_X.at(-1),yy,.7));
  ['年','月','日','摘    要','專案代號','金   額'].forEach((s,i)=>txt(x,s,(NO_X[i]+NO_X[i+1])/2,t+11.5,9.3,'center'));
  txt(x,'總        計',205,t+125.5,10,'center');signatures(x,t,'no',slot);profile(x,t+149);
  if(slot<2)cut(x,slot===0?255:512);
}
function fillNo(x,e,slot){
  noFrame(x,slot);if(!e)return;
  const t=NO_TOP[slot],ys=[t,t+23.1,t+45.8,t+68.6,t+91.3,t+114.1,t+137.2],cy=(ys[1]+ys[2])/2,c=e.computed||{};
  const [yy,mm,dd]=roc(e.date);
  [yy,mm,dd].forEach((v,i)=>txt(x,v,(NO_X[i]+NO_X[i+1])/2,cy,8.5,'center'));
  fitTxt(x,c.noReceiptSummary||'里程補助',(NO_X[3]+NO_X[4])/2,cy,NO_X[4]-NO_X[3]-5,8.3);
  fitTxt(x,e.projectCode||'',(NO_X[4]+NO_X[5])/2,cy,NO_X[5]-NO_X[4]-5,8.5);
  fitTxt(x,c.mileageFormula||fmt(c.mileage),(NO_X[5]+NO_X[6])/2,cy,NO_X[6]-NO_X[5]-5,8.5);
  txt(x,fmt(c.mileage),(NO_X[5]+NO_X[6])/2,(ys[5]+ys[6])/2,8.8,'center');
}

function makePages(items,filler){
  const out=[];for(let i=0;i<items.length;i+=3){const [c,x]=page();for(let s=0;s<3;s++)filler(x,items[i+s]||null,s);out.push(c);}return out;
}
async function jspdf(){return (await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm')).jsPDF;}
async function toPdf(canvases){
  const JsPDF=await jspdf();const d=new JsPDF({orientation:'portrait',unit:'pt',format:'a4',compress:true});
  canvases.forEach((c,i)=>{if(i)d.addPage('a4','portrait');d.addImage(c.toDataURL('image/jpeg',.94),'JPEG',0,0,595.28,841.89,undefined,'FAST');});
  return d.output('blob');
}
export async function generateBatchPdfs(events,batchName='本週請款'){
  const general=events.filter(e=>(e.computed?.generalAmount||0)>0);
  const travel=events.filter(e=>e.eventType==='國內出差');
  const noReceipt=events.filter(e=>(e.computed?.mileage||0)>0);
  const date=events[0]?.date||new Date().toISOString().slice(0,10);
  const stamp=date.replaceAll('-','');
  const groups=[
    ['一般請款單',general,fillGeneral],
    ['國內出差費申請單',travel,fillTravel],
    ['無外來憑證支出證明單',noReceipt,fillNo]
  ];
  const files=[],allPages=[];
  for(const [label,items,filler] of groups){
    if(!items.length)continue;
    const pages=makePages(items,filler);allPages.push(...pages);
    files.push({name:`${stamp}_${label}.pdf`,blob:await toPdf(pages),kind:label});
  }
  if(allPages.length){
    const safe=String(batchName||'整批報帳').replace(/[\\/:*?"<>|]/g,'_');
    files.unshift({name:`${stamp}_${safe}_整批報帳.pdf`,blob:await toPdf(allPages),kind:'整批'});
  }
  return files;
}
export function downloadBlob(blob,name){
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
}
export function openPdf(blob){
  const u=URL.createObjectURL(blob);window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),60000);
}