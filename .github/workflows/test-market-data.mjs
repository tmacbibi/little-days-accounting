import assert from 'node:assert/strict';
import { normalizeDate, parseTWSE, parseTPEx, securityType } from './update-market-data.mjs';

assert.equal(normalizeDate('20260915'),'2026-09-15');
assert.equal(normalizeDate('1150915'),'2026-09-15');
assert.equal(normalizeDate('115/09/15'),'2026-09-15');

const twse=parseTWSE([{Code:'2330',Name:'台積電',ClosingPrice:'1,250.00',Date:'20260915'}]);
assert.deepEqual(twse[0],{symbol:'2330',name:'台積電',market:'TWSE',securityType:'stock',date:'2026-09-15',close:1250});

const etf=parseTWSE([{Code:'00981A',Name:'主動統一台股增長',ClosingPrice:'29.44',Date:'20260915'}]);
assert.equal(etf[0].securityType,'etf');

const tpex=parseTPEx([{SecuritiesCompanyCode:'6488',CompanyName:'環球晶',Close:'450.5',Date:'1150915'}]);
assert.deepEqual(tpex[0],{symbol:'6488',name:'環球晶',market:'TPEx',securityType:'stock',date:'2026-09-15',close:450.5});

assert.equal(securityType('00937B','群益ESG投等債20+'),'bond-etf');
console.log('market-data parser tests passed');
