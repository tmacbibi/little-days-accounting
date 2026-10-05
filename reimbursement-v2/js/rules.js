export const APP_VERSION = '2.0.0-alpha.24';
export const MILEAGE_RATE = 8;
export const MEAL_RATES = { breakfast: 120, lunch: 180, dinner: 180 };
export const DEFAULT_START_LOCATION = '蘆洲';
export const PRESET_MILEAGE_ROUTES = [
  { endLocation: '板橋', km: 40 },
  { endLocation: '宜蘭', km: 140 },
  { endLocation: '國土署', km: 10 },
  { endLocation: '新莊', km: 30 },
  { endLocation: '宜蘭羅東', km: 150 },
  { endLocation: '杭州北路', km: 20 }
];

export const EVENT_TYPES = ['雙北內開會或洽公','國內出差','會議餐飲','通話費補助','一般請款'];
export const TRANSPORTS = ['自行開車','高鐵','計程車','無交通費'];
export const EXPENSE_TYPES = ['停車費','計程車','實際餐費','會議餐食','會議飲料','宿費','其他','里程補助'];

export function money(n) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(Number(n || 0));
}

export function normalizeExpense(expense) {
  const rawKm = Number(expense.km || 0);
  const km = Number.isFinite(rawKm) ? Math.max(0, rawKm) : 0;
  const rawAmount = expense.type === '里程補助' ? km * MILEAGE_RATE : Number(expense.amount || 0);
  const amount = Number.isFinite(rawAmount) ? Math.max(0, rawAmount) : 0;
  const summary = expense.type === '其他' ? (expense.itemName?.trim() || expense.note?.trim() || '其他') : expense.type;
  return { ...expense, km, amount, summary };
}

export function calculateEvent(input) {
  const expenses = (input.expenses || []).map(normalizeExpense).filter(x => x.amount > 0);
  const isTravel = input.eventType === '國內出差';
  const selfDrive = input.transport === '自行開車';
  const mainKm = selfDrive ? Math.max(0, Number(input.km || 0)) : 0;
  const mileageExtras = expenses.filter(e => e.type === '里程補助');
  const mileageKm = mainKm + mileageExtras.reduce((s,e) => s + e.km, 0);
  const mileage = mileageKm * MILEAGE_RATE;
  const parkingExtras = expenses.filter(e => e.type === '停車費').reduce((s,e) => s + e.amount, 0);
  const parking = (selfDrive ? Math.max(0, Number(input.parking || 0)) : 0) + parkingExtras;
  const highSpeedRailFare = input.transport === '高鐵' ? Math.max(0, Number(input.highSpeedRailFare || 0)) : 0;
  const taxiFare = input.transport === '計程車' ? Math.max(0, Number(input.taxiFare || 0)) : 0;
  const highSpeedRailExtras = expenses.filter(e => e.type === '高鐵').reduce((s,e) => s + e.amount, 0);
  const taxiExtras = expenses.filter(e => e.type === '計程車').reduce((s,e) => s + e.amount, 0);
  // 若主交通已直接填金額，就避免把同一筆舊資料重複加總；但其他交通方式中的附加高鐵/計程車費仍需計入。
  const legacyHighSpeedRail = input.transport === '高鐵' && highSpeedRailFare > 0 ? 0 : highSpeedRailExtras;
  const legacyTaxi = input.transport === '計程車' && taxiFare > 0 ? 0 : taxiExtras;
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
  // 自訂品項列入一般請款單，以保留實際品名；不再只顯示出差表的「其他」金額。
  const travelOther = 0;
  const travelTotal = travelTraffic + fixedMeal + travelLodging + travelOther;

  const generalAllowedTravel = new Set(['實際餐費','會議餐食','會議飲料','通話費補助','其他']);
  const generalDetails = isTravel
    ? [
        ...((actualMealAmount > 0 || legacyActualMeal > 0) ? [{type:'實際餐費', summary:'實際餐費', amount:actualMealAmount + legacyActualMeal}] : []),
        ...expenses.filter(e => generalAllowedTravel.has(e.type) && e.type !== '實際餐費')
      ]
    : expenses.filter(e =>
        e.type !== '停車費' && e.type !== '里程補助' &&
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

  const mileageRoutes = [
    ...(mainKm > 0 ? [String(input.route || '').trim()] : []),
    ...mileageExtras.map(e => String(e.route || e.note || '').trim())
  ].filter(Boolean);

  return {
    mileage, mileageKm, parking, highSpeedRailFare, taxiFare, actualMealAmount, fixedMeal,
    travelTraffic, travelLodging, travelOther, travelTotal,
    generalMainAmount, generalMainSummary, generalDetails, generalRows, generalAmount,
    claimTotal: isTravel ? travelTotal + generalAmount : generalAmount,
    requiredForms,
    overGeneralRows: generalRows.length > 4,
    mileageFormula: mileage > 0 ? `${mileageKm}×${MILEAGE_RATE}＝${mileage}` : '',
    noReceiptSummary: mileage > 0 ? `里程補助${mileageRoutes.length ? `（${[...new Set(mileageRoutes)].join('、')}）` : ''}` : ''
  };
}
