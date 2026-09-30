/**
 * List enter/leave and button press use a real spring integrator (spring.js).
 * CSS easing remains the fallback when the user prefers reduced motion.
 * A same-batch add of the same identity is a reorder, not a disappearance.
 */

import { SPRING, springTrack } from './spring.js';

export const MOTION_LIST_SELECTOR = [
  '.bp-memo-grid',
  '.bp-place-grid',
  '.places-list-body',
  '.chat-messages-scroll',
  '.history-meetings-grid',
  '.history-bento-grid',
  '.date-modal-settlement-list',
  '.date-modal-memo-list',
  '.date-modal-places-list',
  '.settlement-participant-list',
  '.memo-list-scroll',
  '.gallery-link-grid',
  '.gallery-file-grid',
  '.media-analysis-feed',
  '.chat-file-attachment-list',
  '.admin-side-menu-list',
  '.bp-motion-list'
].join(',');

const STAGGER_MS = 28;
const STAGGER_CAP = 12;
const NEG_TEXT_RE = /삭제|제거|버리|탈퇴|강퇴|차단|지우|제외|delete|remove|discard/i;
const NEG_CLASS_RE = /(^|[\s_])(btn-danger|danger|delete|remove|discard|destructive|content-thumb-delete-btn|bp-attend-row-remove|bp-lightbox-tag-remove)([\s_]|$)/i;

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
  if (node.classList?.contains('bp-skel-list') || node.classList?.contains('bp-skel-row') || node.classList?.contains('bp-skel-block')) return false;
  if (parent?.classList?.contains('chat-messages-scroll')) return node.hasAttribute('data-msg-row-id');
  return true;
}

export function isNegativeControl(el) {
  if (!el || el.nodeType !== 1) return false;
  const tag = String(el.tagName || '');
  if (tag !== 'BUTTON' && el.getAttribute?.('role') !== 'button') return false;
  const cls = typeof el.className === 'string' ? el.className : '';
  if (NEG_CLASS_RE.test(cls)) return true;
  const label = `${el.getAttribute?.('aria-label') || ''} ${el.getAttribute?.('title') || ''}`;
  if (NEG_TEXT_RE.test(label)) return true;
  const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
  return text.length > 0 && text.length <= 16 && NEG_TEXT_RE.test(text);
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

function tagNegative(node) {
  if (!node || node.nodeType !== 1) return;
  if (isNegativeControl(node)) node.classList.add('bp-neg');
  node.querySelectorAll?.('button, [role="button"]').forEach(el => {
    if (isNegativeControl(el)) el.classList.add('bp-neg');
  });
}

function armLeave(node, delayMs) {
  node.classList.add('bp-motion-leave');
  node.setAttribute('data-bp-leave', '1');
  node.setAttribute('data-bp-sprung', '1');
  const run = () => playSpring(node, {
    from: readScale(node),
    to: 0.9,
    opacityFrom: 1,
    opacityTo: 0,
    ...SPRING.leave,
  });
  if (delayMs) setTimeout(run, delayMs);
  else run();
}

const springRuns = new WeakMap();

export function readScale(el) {
  try {
    const value = parseFloat(getComputedStyle(el).scale);
    if (Number.isFinite(value) && value > 0) return value;
  } catch (_) {}
  const inline = parseFloat(el?.style?.scale);
  return Number.isFinite(inline) && inline > 0 ? inline : 1;
}

export function playSpring(el, spec) {
  if (!el || typeof el.animate !== 'function') return null;
  const prev = springRuns.get(el);
  if (prev) {
    try { prev.cancel(); } catch (_) {}
  }
  const from = spec.from == null ? readScale(el) : spec.from;
  const track = springTrack({ ...spec, from });
  const anim = el.animate(track.keyframes, { duration: track.duration, fill: 'both', easing: 'linear' });
  springRuns.set(el, anim);
  const settle = () => {
    if (springRuns.get(el) !== anim) return;
    springRuns.delete(el);
    try {
      el.style.scale = String(spec.to);
      if (spec.opacityTo != null) el.style.opacity = String(spec.opacityTo);
      anim.cancel();
    } catch (_) {}
  };
  anim.finished?.then(settle, () => {});
  return anim;
}

function pressTarget(node) {
  const button = node?.closest?.('button, [role="button"], [role="tab"]');
  if (!button || button.disabled || button.getAttribute?.('aria-disabled') === 'true') return null;
  if (button.classList?.contains('bp-btn-gamified-confirm')) return null;
  return button;
}

function springEnter(node, delayMs) {
  if (!node || node.nodeType !== 1 || node.getAttribute('data-bp-sprung') || node.getAttribute('data-bp-leave') || node.dataset.bpSpringArm) return;
  node.dataset.bpSpringArm = '1';
  const run = () => {
    if (!node.isConnected) return;
    node.setAttribute('data-bp-sprung', '1');
    playSpring(node, {
      from: 0.9,
      to: 1,
      opacityFrom: 0,
      opacityTo: 1,
      ...SPRING.enter,
    });
  };
  if (delayMs) setTimeout(run, delayMs);
  else run();
}

export function installTinyMotion(doc = document) {
  if (!doc || typeof MutationObserver !== 'function' || reducedMotion()) return () => {};
  const root = doc.documentElement;
  if (!root || root.dataset.bpTinyMotion === '1') return () => {};
  root.dataset.bpTinyMotion = '1';
  const shellOn = () => !!doc.querySelector('.renewal-shell.v2-design');
  const isList = el => !!(el && el.matches && el.matches(MOTION_LIST_SELECTOR) && !el.getAttribute?.('data-bp-leave') && shellOn());
  const dropLater = (node, delayMs) => {
    const remove = () => { if (node.isConnected) node.remove(); };
    node.addEventListener?.('animationend', remove, { once: true });
    setTimeout(remove, delayMs + 760);
  };
  const enterAdded = node => {
    if (!node || node.nodeType !== 1 || node.getAttribute?.('data-bp-leave')) return;
    if (isList(node)) {
      [...node.children].forEach((child, index) => {
        if (!isMotionItem(node, child)) return;
        springEnter(child, Math.min(index, STAGGER_CAP) * STAGGER_MS);
      });
      return;
    }
    const parent = node.parentElement;
    if (!parent || !isList(parent) || !isMotionItem(parent, node)) return;
    const index = [...parent.children].indexOf(node);
    springEnter(node, Math.min(Math.max(index, 0), STAGGER_CAP) * STAGGER_MS);
  };
  let pressed = null;
  const releasePress = () => {
    if (!pressed) return;
    const button = pressed;
    pressed = null;
    playSpring(button, { from: readScale(button), to: 1, ...SPRING.release });
  };
  const onPointerDown = event => {
    if (!shellOn()) return;
    const button = pressTarget(event.target);
    if (!button) return;
    if (pressed && pressed !== button) releasePress();
    pressed = button;
    playSpring(button, { from: readScale(button), to: 0.94, ...SPRING.press });
  };
  doc.addEventListener('pointerdown', onPointerDown, true);
  doc.addEventListener('pointerup', releasePress, true);
  doc.addEventListener('pointercancel', releasePress, true);
  const observer = new MutationObserver(mutations => {
    if (!shellOn()) return;
    const exits = planListExits(mutations, isList);
    exits.forEach(({ node, parent, delayMs }, index) => {
      if (index > 24 || !parent.isConnected) return;
      const ghost = node.cloneNode(true);
      ghost.setAttribute('aria-hidden', 'true');
      armLeave(ghost, delayMs);
      ghost.querySelectorAll?.('button, a, input, textarea, select').forEach(control => {
        control.setAttribute('tabindex', '-1');
      });
      const at = parent.children[Math.min(index, parent.children.length)] || null;
      parent.insertBefore(ghost, at);
      dropLater(ghost, delayMs);
    });
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes || []) {
        if (!node || node.nodeType !== 1 || node.getAttribute?.('data-bp-leave')) continue;
        if (!isList(node) || !mutation.target?.isConnected) continue;
        const ghost = node.cloneNode(true);
        ghost.setAttribute('data-bp-leave', '1');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.classList.add('bp-motion-leave-host');
        const kids = [...ghost.children].filter(child => child.nodeType === 1).slice(0, STAGGER_CAP);
        [...ghost.children].forEach(child => { if (!kids.includes(child)) child.remove(); });
        kids.forEach((child, index) => armLeave(child, index * STAGGER_MS));
        ghost.querySelectorAll?.('button, a, input, textarea, select').forEach(control => {
          control.setAttribute('tabindex', '-1');
        });
        mutation.target.appendChild(ghost);
        dropLater(ghost, STAGGER_CAP * STAGGER_MS);
      }
      for (const node of mutation.addedNodes || []) {
        tagNegative(node);
        enterAdded(node);
      }
    }
  });
  doc.querySelectorAll?.(MOTION_LIST_SELECTOR).forEach(list => {
    [...list.children].forEach(child => child.setAttribute('data-bp-sprung', '1'));
  });
  root.dataset.bpSpring = '1';
  observer.observe(doc.body, { childList: true, subtree: true });
  tagNegative(doc.body);
  return () => {
    observer.disconnect();
    doc.removeEventListener('pointerdown', onPointerDown, true);
    doc.removeEventListener('pointerup', releasePress, true);
    doc.removeEventListener('pointercancel', releasePress, true);
  };
}

if (typeof document !== 'undefined') installTinyMotion(document);
