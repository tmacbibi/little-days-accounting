export const APP_VERSION = '2.0.0-alpha.5';
export const MILEAGE_RATE = 8;
export const MEAL_RATES = { breakfast: 120, lunch: 180, dinner: 180 };

export const EVENT_TYPES = ['雙北內開會或洽公','國內出差','會議餐飲','通話費補助','一般請款'];
export const TRANSPORTS = ['自行開車','高鐵','計程車','無交通費'];
export const EXPENSE_TYPES = ['高鐵','計程車','實際餐費','會議餐食','會議飲料','宿費','其他','通話費補助'];

export function money(n) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(Number(n || 0));
}

export function normalizeExpense(expense) {
  const amount = Number(expense.amount || 0);
  const summary = expense.type === '其他' ? (expense.note?.trim() || '其他') : expense.type;
  return { ...expense, amount, summary };
}

export function calculateEvent(input) {
  const expenses = (input.expenses || []).map(normalizeExpense).filter(x => x.amount > 0);
  const isTravel = input.eventType === '國內出差';
  const selfDrive = input.transport === '自行開車';
  const mileage = selfDrive ? Math.max(0, Number(input.km || 0)) * MILEAGE_RATE : 0;
  const parking = selfDrive ? Math.max(0, Number(input.parking || 0)) : 0;
  const highSpeedRailFare = input.transport === '高鐵' ? Math.max(0, Number(input.highSpeedRailFare || 0)) : 0;
  const taxiFare = input.transport === '計程車' ? Math.max(0, Number(input.taxiFare || 0)) : 0;
  const legacyHighSpeedRail = input.transport === '高鐵' && highSpeedRailFare <= 0 ? expenses.filter(e => e.type === '高鐵').reduce((s,e) => s + e.amount, 0) : 0;
  const legacyTaxi = input.transport === '計程車' && taxiFare <= 0 ? expenses.filter(e => e.type === '計程車').reduce((s,e) => s + e.amount, 0) : 0;
  const actualMealAmount = isTravel && input.mealMode === '實際餐費' ? Math.max(0, Number(input.actualMealAmount || 0)) : 0;
  const legacyActualMeal = isTravel && input.mealMode === '實際餐費' && actualMealAmount <= 0 ? expenses.filter(e => e.type === '實際餐費').reduce((s,e) => s + e.amount, 0) : 0;

  const fixedMeal = isTravel && input.mealMode === '定額膳費'
    ? (input.breakfast ? MEAL_RATES.breakfast : 0)
      + (input.lunch ? MEAL_RATES.lunch : 0)
      + (input.dinner ? MEAL_RATES.dinner : 0)
    : 0;

  const sumType = (...types) => expenses.filter(e => types.includes(e.type)).reduce((s,e) => s + e.amount, 0);
  const travelTraffic = isTravel ? mileage + parking + highSpeedRailFare + legacyHighSpeedRail + taxiFare + legacyTaxi : 0;
  const travelLodging = isTravel ? sumType('宿費') : 0;
  const travelOther = isTravel ? sumType('其他') : 0;
  const travelTotal = travelTraffic + fixedMeal + travelLodging + travelOther;

  const generalAllowedTravel = new Set(['實際餐費','會議餐食','會議飲料','通話費補助']);
  const generalDetails = isTravel
    ? [
        ...((actualMealAmount > 0 || legacyActualMeal > 0) ? [{type:'實際餐費', summary:'實際餐費', amount:actualMealAmount + legacyActualMeal}] : []),
        ...expenses.filter(e => generalAllowedTravel.has(e.type) && e.type !== '實際餐費')
      ]
    : expenses.filter(e =>
        !(input.transport === '高鐵' && e.type === '高鐵') &&
        !(input.transport === '計程車' && e.type === '計程車')
      );

  const generalMainAmount = isTravel ? 0 : mileage + parking + highSpeedRailFare + legacyHighSpeedRail + taxiFare + legacyTaxi;
  const generalMainParts = [];
  if (mileage > 0) generalMainParts.push('里程補助');
  if (parking > 0) generalMainParts.push('停車費');
  if (highSpeedRailFare > 0 || legacyHighSpeedRail > 0) generalMainParts.push('高鐵票價');
  if (taxiFare > 0 || legacyTaxi > 0) generalMainParts.push('計程車');
  const generalMainSummary = generalMainParts.join('＋');
  const generalAmount = generalMainAmount + generalDetails.reduce((s,e) => s + e.amount, 0);
  const generalRows = [
    ...(generalMainAmount > 0 ? [{ summary: generalMainSummary, amount: generalMainAmount }] : []),
    ...generalDetails.map(e => ({ summary: e.summary, amount: e.amount }))
  ];

  let requiredForms = [];
  if (isTravel) requiredForms.push('國內出差費申請單');
  if (generalAmount > 0) requiredForms.push('一般請款單');
  if (mileage > 0) requiredForms.push('無外來憑證單');

  return {
    mileage, parking, highSpeedRailFare, taxiFare, actualMealAmount, fixedMeal,
    travelTraffic, travelLodging, travelOther, travelTotal,
    generalMainAmount, generalMainSummary, generalDetails, generalRows, generalAmount,
    claimTotal: isTravel ? travelTotal + generalAmount : generalAmount,
    requiredForms,
    overGeneralRows: generalRows.length > 4,
    mileageFormula: mileage > 0 ? `${Number(input.km || 0)}×${MILEAGE_RATE}＝${mileage}` : '',
    noReceiptSummary: mileage > 0 ? `里程補助（${String(input.route || '').replace(/[－-]/g,'來回')}）` : ''
  };
}