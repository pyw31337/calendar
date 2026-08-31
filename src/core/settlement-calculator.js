/**
 * Calculate how much each participant should receive from (+ display) or pay to
 * (- display) the settlement owner. `amount` keeps the app's existing internal
 * convention: negative means a refund is due, positive means a contribution is
 * owed.
 *
 * Personal expenses are payments already included in totalExpense, not costs to
 * add on top of it. The settlement owner (normally depositorName) is assumed to
 * have paid the part of totalExpense that was not covered by those prepayments.
 */
export function calculateSettlementRows(totalExpense, participantNames, personalTotals = new Map(), settlementOwnerName = '') {
  const names = Array.from(new Set((participantNames || [])
    .map(name => String(name || '').trim())
    .filter(Boolean)));
  if (names.length === 0) return [];

  const total = Math.max(0, Math.round(Number(totalExpense) || 0));
  const ownerName = names.includes(String(settlementOwnerName || '').trim())
    ? String(settlementOwnerName || '').trim()
    : '';
  const roundedShare = Math.round(total / names.length);

  // Keep the rows balanced to the won. When an owner exists, the owner absorbs
  // the rounding remainder so 536,000 / 3 becomes 178,666 + 178,667 + 178,667.
  const shares = new Map();
  let allocated = 0;
  names.forEach((name, index) => {
    const isBalancingRow = ownerName ? name === ownerName : index === names.length - 1;
    const share = isBalancingRow ? total - roundedShare * (names.length - 1) : roundedShare;
    shares.set(name, share);
    allocated += share;
  });
  if (allocated !== total) {
    const balancingName = ownerName || names[names.length - 1];
    shares.set(balancingName, (shares.get(balancingName) || 0) + total - allocated);
  }

  const prepaidTotal = names.reduce((sum, name) => {
    const adjustment = Number(personalTotals.get(name)) || 0;
    return adjustment < 0 ? sum + Math.abs(adjustment) : sum;
  }, 0);
  const ownerRemainderPaid = ownerName ? Math.max(0, total - prepaidTotal) : 0;

  return names.map(name => {
    const personalAdjustment = Number(personalTotals.get(name)) || 0;
    const share = shares.get(name) || 0;
    const ownerPayment = name === ownerName ? ownerRemainderPaid : 0;
    return {
      name,
      share,
      personalPaid: personalAdjustment < 0 ? Math.abs(personalAdjustment) : 0,
      ownerPayment,
      amount: share + personalAdjustment - ownerPayment
    };
  });
}

/**
 * Build an explicit, public-fund-oriented settlement plan.
 *
 * `payerTotals` contains money actually advanced by each participant. Expenses
 * paid directly from the common fund are supplied separately as `commonFundPaid`
 * and remain visible in the event total, but are not charged to participants a
 * second time. Transfers are routed through the common fund clearing account so
 * contributors and reimbursements can be shown without changing the fund's
 * principal balance.
 */
export function calculateSettlementPlan(totalExpense, participantNames, payerTotals = new Map(), commonFundPaid = 0) {
  const names = Array.from(new Set((participantNames || [])
    .map(name => String(name || '').trim())
    .filter(Boolean)));
  const total = Math.max(0, Math.round(Number(totalExpense) || 0));
  const fundPaid = Math.min(total, Math.max(0, Math.round(Number(commonFundPaid) || 0)));
  const participantFunded = Math.max(0, total - fundPaid);
  if (names.length === 0) {
    return { totalExpense: total, commonFundPaid: fundPaid, participantFunded, rows: [], contributions: [], reimbursements: [], offsets: [], clearingTotal: 0, fundNetChange: -fundPaid };
  }

  const roundedShare = Math.round(participantFunded / names.length);
  const shares = new Map();
  // Put the one-won rounding remainder on the largest actual payer. This keeps
  // the transfer instructions intuitive without coupling rounding to the bank
  // account owner or the rotating treasurer.
  const balancingName = names.reduce((selected, name) => {
    const paid = Math.max(0, Math.round(Number(payerTotals.get(name)) || 0));
    const selectedPaid = Math.max(0, Math.round(Number(payerTotals.get(selected)) || 0));
    return paid > selectedPaid ? name : selected;
  }, names[0]);
  names.forEach(name => {
    shares.set(name, name === balancingName
      ? participantFunded - roundedShare * (names.length - 1)
      : roundedShare);
  });

  const rows = names.map(name => {
    const paid = Math.max(0, Math.round(Number(payerTotals.get(name)) || 0));
    const share = shares.get(name) || 0;
    const net = paid - share;
    return { name, share, paid, net, amount: -net };
  });
  const contributions = rows.filter(row => row.net < 0).map(row => ({ name: row.name, amount: Math.abs(row.net) }));
  const reimbursements = rows.filter(row => row.net > 0).map(row => ({ name: row.name, amount: row.net }));
  const offsets = rows.filter(row => row.paid > 0 && row.share > 0).map(row => ({ name: row.name, amount: Math.min(row.paid, row.share) }));
  const contributionTotal = contributions.reduce((sum, row) => sum + row.amount, 0);
  const reimbursementTotal = reimbursements.reduce((sum, row) => sum + row.amount, 0);

  return {
    totalExpense: total,
    commonFundPaid: fundPaid,
    participantFunded,
    rows,
    contributions,
    reimbursements,
    offsets,
    clearingTotal: Math.min(contributionTotal, reimbursementTotal),
    fundNetChange: -fundPaid
  };
}

export function isSettlementClearingIncomeEntry(item) {
  const isIncome = item?.isIncome === true || Number(item?.amount) < 0;
  if (!isIncome) return false;
  if (item?.flowType === 'settlement-clearing') return true;
  return /(정산금|분담금|정산\s*입금)/.test(String(item?.label || ''));
}

export function getSettlementEntryParticipantId(item) {
  return String(item?.participantId || item?.payerId || '').trim();
}

export function isPersonalSettlementEntry(item) {
  if (item?.fundingType === 'personal') return true;
  if (item?.fundingType === 'fund' || item?.fundingType === 'settlement-clearing') return false;
  const isIncome = item?.isIncome === true || Number(item?.amount) < 0;
  // Legacy expenses used payerId for a personal advance. Income records did not have an
  // equivalent field, so only new income rows with an explicit participantId are personal.
  return isIncome
    ? Boolean(String(item?.participantId || '').trim())
    : Boolean(String(item?.payerId || '').trim());
}

export function doesSettlementEntryAffectPrincipal(item) {
  const isIncome = item?.isIncome === true || Number(item?.amount) < 0;
  if (isPersonalSettlementEntry(item)) return false;
  return isIncome ? !isSettlementClearingIncomeEntry(item) : true;
}

export function calculateFundPrincipalBalance(baseBudget, items = []) {
  return (Array.isArray(items) ? items : []).reduce((balance, item) => {
    if (!doesSettlementEntryAffectPrincipal(item)) return balance;
    const amount = Math.abs(Number(item?.amount) || 0);
    const isIncome = item?.isIncome === true || Number(item?.amount) < 0;
    return balance + (isIncome ? amount : -amount);
  }, Math.max(0, Math.round(Number(baseBudget) || 0)));
}
