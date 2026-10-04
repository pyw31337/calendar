/**
 * Settlement cards reference expense entries by a stable item key rather than by a
 * display label.  Keeping the reservation logic here makes the create and edit
 * forms agree on which expense can still belong to a card.
 */
function getCardItemKeys(card) {
  const keys = [
    ...(Array.isArray(card?.checkedItemKeys) ? card.checkedItemKeys : []),
    ...Object.keys(card?.checkedItems || {})
  ];
  return keys.map(key => String(key || '').trim()).filter(Boolean);
}

/**
 * Returns expense keys already used by a different, persisted settlement card.
 * The currently edited card is intentionally omitted so reopening it never hides
 * its own selections.  Supporting the legacy `checkedItems` object also keeps
 * old cards from accidentally allowing a duplicate registration.
 */
export function getReservedSettlementItemKeys(cards, currentCardId = '') {
  const reserved = new Set();
  const ownId = String(currentCardId || '').trim();

  (Array.isArray(cards) ? cards : []).forEach(card => {
    if (!card || (ownId && String(card.id || '') === ownId)) return;
    getCardItemKeys(card).forEach(key => reserved.add(key));
  });

  return reserved;
}

export function filterSelectableSettlementExpenses(expenses, reservedKeys) {
  const reserved = reservedKeys instanceof Set ? reservedKeys : new Set(reservedKeys || []);
  return (Array.isArray(expenses) ? expenses : []).filter(expense => !reserved.has(expense?.itemKey));
}
