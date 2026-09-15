import assert from 'node:assert/strict';
import { normalizeDate, parseTWSE, parseTPEx, parseTWSEIndex, parseTPExIndex, parseIsinHtml, securityType } from './update-market-data.mjs';

assert.equal(normalizeDate('20260915'),'2026-09-15');
assert.equal(normalizeDate('1150915'),'2026-09-15');
assert.equal(normalizeDate('115/09/15'),'2026-09-15');

const twse=parseTWSE([{Code:'2330',Name:'台積電',ClosingPrice:'1,250.00',Date:'20260915'}]);
assert.equal(twse[0].symbol,'2330'); assert.equal(twse[0].name,'台積電'); assert.equal(twse[0].close,1250);

const etf=parseTWSE([{Code:'00981A',Name:'主動統一台股增長',ClosingPrice:'29.44',Date:'20260915'}]);
assert.equal(etf[0].securityType,'etf');

const tpex=parseTPEx([{SecuritiesCompanyCode:'6488',CompanyName:'環球晶',Close:'450.5',Date:'1150915'}]);
assert.equal(tpex[0].symbol,'6488'); assert.equal(tpex[0].name,'環球晶'); assert.equal(tpex[0].close,450.5);

const listedHtml=`
<table>
<tr><td>股票</td></tr>
<tr><td>2002　中鋼</td><td>TW0002002003</td><td>1971/12/02</td><td>上市</td><td>鋼鐵工業</td><td>ESVUFR</td><td></td></tr>
<tr><td>00713　元大台灣高息低波</td><td>TW0000071309</td><td>2017/09/27</td><td>上市</td><td></td><td>CEOIEU</td><td></td></tr>
<tr><td>035600　測試權證</td><td>TW25Z0356001</td><td>2025/09/09</td><td>上市</td><td></td><td>RWSCCA</td><td></td></tr>
</table>`;
const listed=parseIsinHtml(listedHtml,{market:'TWSE'});
assert.equal(listed.find(x=>x.symbol==='2002')?.name,'中鋼');
assert.equal(listed.find(x=>x.symbol==='00713')?.name,'元大台灣高息低波');
assert.equal(listed.some(x=>x.symbol==='035600'),false);

const otcHtml=`
<table>
<tr><td>00937B　群益ESG投等債20+</td><td>TW00000937B2</td><td>2023/12/05</td><td>上櫃</td><td></td><td>CEOIBU</td><td></td></tr>
</table>`;
const otcMaster=parseIsinHtml(otcHtml,{market:'TPEx'});
assert.equal(otcMaster[0].symbol,'00937B');
assert.equal(otcMaster[0].name,'群益ESG投等債20+');
assert.equal(otcMaster[0].securityType,'bond-etf');

const taiex=parseTWSEIndex([{Date:'1150915',TAIEX:'25,500.12',Change:'120.50'}]);
assert.equal(taiex[0].code,'TAIEX'); assert.equal(taiex[0].value,25500.12);
const otc=parseTPExIndex([{Date:'1150915',Index:'265.33',Change:'-1.20'}]);
assert.equal(otc[0].code,'OTC'); assert.equal(otc[0].value,265.33);

assert.equal(securityType('00937B','群益ESG投等債20+'),'bond-etf');
console.log('market-data parser tests passed, including 2002 / 00713 / 00937B master coverage');
