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
    const personalPaid = personalAdjustment < 0 ? Math.abs(personalAdjustment) : 0;
    return {
      name,
      share,
      personalPaid,
      ownerPayment,
      // The amount a participant actually fronted for this settlement.  This
      // intentionally includes the settlement owner's uncovered remainder,
      // so a UI can explain both the equal share and the real prepayment
      // without reimplementing the balancing rules above.
      actualPaid: personalPaid + ownerPayment,
      amount: share + personalAdjustment - ownerPayment
    };
  });
}

/**
 * Convert balanced settlement rows into the smallest set of person-to-person
 * transfers. A positive row amount owes money; a negative amount is due a
 * refund. Rows that are already settled are omitted.
 */
export function calculateSettlementTransfers(rows = []) {
  const debtors = (Array.isArray(rows) ? rows : [])
    .filter(row => row && String(row.name || '').trim() && Number(row.amount) > 0)
    .map(row => ({ name: String(row.name).trim(), remaining: Math.round(Number(row.amount)) }));
  const creditors = (Array.isArray(rows) ? rows : [])
    .filter(row => row && String(row.name || '').trim() && Number(row.amount) < 0)
    .map(row => ({ name: String(row.name).trim(), remaining: Math.round(Math.abs(Number(row.amount))) }));

  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.remaining, creditor.remaining);
    if (amount > 0) transfers.push({ from: debtor.name, to: creditor.name, amount });
    debtor.remaining -= amount;
    creditor.remaining -= amount;
    if (debtor.remaining === 0) debtorIndex += 1;
    if (creditor.remaining === 0) creditorIndex += 1;
  }
  return transfers;
}
