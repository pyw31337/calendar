/**
 * List exit ghosts. Enter stagger is CSS (nth-child). React removes a node in the
 * same commit it updates, so a same-batch add of the same identity is a reorder,
 * not a disappearance, and must not play the leave motion.
 */

export const MOTION_LIST_SELECTOR = [
  '.bp-memo-grid',
  '.bp-place-grid',
  '.places-list-body',
  '.chat-messages-scroll',
  '.history-meetings-grid',
  '.history-bento-grid',
  '.date-modal-settlement-list',
  '.settlement-participant-list'
].join(',');

const STAGGER_MS = 28;
const STAGGER_CAP = 12;

export function itemIdentity(node) {
  if (!node || node.nodeType !== 1 || node.getAttribute?.('data-bp-leave')) return '';
  const attr = node.getAttribute('data-msg-row-id')
    || node.getAttribute('data-v2-memo-id')
    || node.getAttribute('data-memo-id')
    || node.getAttribute('data-place-id')
    || (node.id || '');
  if (attr) return String(attr);
  const text = String(node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  return text ? `t:${text}` : '';
}

export function isMotionItem(parent, node) {
  if (!node || node.nodeType !== 1 || node.getAttribute?.('data-bp-leave')) return false;
  if (parent?.classList?.contains('chat-messages-scroll')) return node.hasAttribute('data-msg-row-id');
  return !node.classList?.contains('bp-skel-list');
}

export function planListExits(mutations, isList = () => true) {
  const added = new Set();
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes || []) {
      const id = itemIdentity(node);
      if (id) added.add(id);
    }
  }
  const exits = [];
  for (const mutation of mutations) {
    if (!isList(mutation.target)) continue;
    for (const node of mutation.removedNodes || []) {
      if (!isMotionItem(mutation.target, node)) continue;
      const id = itemIdentity(node);
      if (!id || added.has(id)) continue;
      exits.push({
        node,
        parent: mutation.target,
        delayMs: Math.min(exits.length, STAGGER_CAP) * STAGGER_MS
      });
    }
  }
  return exits;
}

function reducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
}

export function installTinyMotion(doc = document) {
  if (!doc || typeof MutationObserver !== 'function' || reducedMotion()) return () => {};
  const root = doc.documentElement;
  if (!root || root.dataset.bpTinyMotion === '1') return () => {};
  root.dataset.bpTinyMotion = '1';
  const isList = el => !!(el && el.matches && el.matches(MOTION_LIST_SELECTOR) && doc.querySelector('.renewal-shell.v2-design'));
  const observer = new MutationObserver(mutations => {
    const exits = planListExits(mutations, isList);
    exits.forEach(({ node, parent, delayMs }, index) => {
      if (index > 24 || !parent.isConnected) return;
      const ghost = node.cloneNode(true);
      ghost.setAttribute('data-bp-leave', '1');
      ghost.classList.add('bp-motion-leave');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.animationDelay = `${delayMs}ms`;
      ghost.querySelectorAll?.('button, a, input, textarea, select').forEach(control => {
        control.setAttribute('tabindex', '-1');
      });
      const at = parent.children[Math.min(index, parent.children.length)] || null;
      parent.insertBefore(ghost, at);
      const remove = () => { if (ghost.isConnected) ghost.remove(); };
      ghost.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, delayMs + 260);
    });
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

if (typeof document !== 'undefined') installTinyMotion(document);
