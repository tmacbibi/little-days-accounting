import assert from 'node:assert/strict';
import { normalizeDate, parseTWSE, parseTPEx, parseTWSEIndex, parseTPExIndex, parseTWSEReport, parseTWSEReportIndex, securityType } from './update-market-data.mjs';

assert.equal(normalizeDate('20260915'),'2026-09-15');
assert.equal(normalizeDate('1150915'),'2026-09-15');
assert.equal(normalizeDate('115/09/15'),'2026-09-15');

const twse=parseTWSE([{Code:'2330',Name:'台積電',ClosingPrice:'1,250.00',Date:'20260915'}]);
assert.equal(twse[0].symbol,'2330'); assert.equal(twse[0].name,'台積電'); assert.equal(twse[0].close,1250);

const etf=parseTWSE([{Code:'00981A',Name:'主動統一台股增長',ClosingPrice:'29.44',Date:'20260915'}]);
assert.equal(etf[0].securityType,'etf');

const tpex=parseTPEx([{SecuritiesCompanyCode:'6488',CompanyName:'環球晶',Close:'450.5',Date:'1150915'}]);
assert.equal(tpex[0].symbol,'6488'); assert.equal(tpex[0].name,'環球晶'); assert.equal(tpex[0].close,450.5);

const taiex=parseTWSEIndex([{Date:'1150915',TAIEX:'25,500.12',Change:'120.50'}]);
assert.equal(taiex[0].code,'TAIEX'); assert.equal(taiex[0].value,25500.12);
const otc=parseTPExIndex([{Date:'1150915',Index:'265.33',Change:'-1.20'}]);
assert.equal(otc[0].code,'OTC'); assert.equal(otc[0].value,265.33);

assert.equal(securityType('00937B','群益ESG投等債20+'),'bond-etf');

const twseReportFixture={
  date:'20260917',
  tables:[
    {fields:['指數','收盤指數','漲跌(+/-)','漲跌點數'],data:[['發行量加權股價指數','25,769.36','+','120.50']]},
    {fields:['證券代號','證券名稱','成交股數','收盤價','漲跌(+/-)','漲跌價差'],data:[['0050','元大台灣50','1,000','62.40','+','0.50'],['2330','台積電','2,000','1,250.00','-','10.00']]}
  ]
};
const twseReportRows=parseTWSEReport(twseReportFixture);
assert.equal(twseReportRows.length,2);
assert.equal(twseReportRows[0].date,'2026-09-17');
assert.equal(twseReportRows[0].symbol,'0050');
assert.equal(twseReportRows[0].close,62.4);
assert.equal(twseReportRows[1].change,-10);
const twseReportIndex=parseTWSEReportIndex(twseReportFixture);
assert.equal(twseReportIndex[0].code,'TAIEX');
assert.equal(twseReportIndex[0].date,'2026-09-17');
assert.equal(twseReportIndex[0].value,25769.36);
console.log('market-data parser tests passed');
