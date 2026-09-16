import assert from 'node:assert/strict';
import { normalizeDate, parseTwseEtfDividendHtml, parseTwseStockExdiv, mergeDividendRows } from './update-dividend-data.mjs';

assert.equal(normalizeDate('115年09月16日'),'2026-09-16');
assert.equal(normalizeDate('2026/10/15'),'2026-10-15');
assert.equal(normalizeDate('1150916'),'2026-09-16');

const html=`<table><tbody><tr><td>00919</td><td>群益台灣精選高息</td><td>115年09月16日</td><td>115年09月22日</td><td>115年10月15日</td><td>1.1</td><td>詳細資料</td><td>115</td></tr></tbody></table>`;
const etf=parseTwseEtfDividendHtml(html);
assert.equal(etf.length,1);
assert.deepEqual(etf[0],{
  symbol:'00919',name:'群益台灣精選高息',market:'TWSE',securityType:'etf',exDate:'2026-09-16',recordDate:'2026-09-22',expectedPayDate:'2026-10-15',perShare:1.1,source:'TWSE_ETFORTUNE',sourceUrl:'https://www.twse.com.tw/zh/ETFortune/dividendList'
});

const stocks=parseTwseStockExdiv([{Date:'1150916',Code:'6446',Name:'藥華藥',Exdividend:'息',CashDividend:'2.500000'}]);
assert.equal(stocks.length,1);
assert.equal(stocks[0].symbol,'6446');
assert.equal(stocks[0].exDate,'2026-09-16');
assert.equal(stocks[0].perShare,2.5);
assert.equal(stocks[0].expectedPayDate,'');

const merged=mergeDividendRows([
  {symbol:'00919',exDate:'2026-09-16',expectedPayDate:'',perShare:1.0,source:'TWSE_OPENAPI_TWT48U_ALL'},
  {symbol:'00919',exDate:'2026-09-16',recordDate:'2026-09-22',expectedPayDate:'2026-10-15',perShare:1.1,source:'TWSE_ETFORTUNE'}
]);
assert.equal(merged.length,1);
assert.equal(merged[0].expectedPayDate,'2026-10-15');
assert.equal(merged[0].perShare,1.1);
console.log('dividend-data parser tests passed');
