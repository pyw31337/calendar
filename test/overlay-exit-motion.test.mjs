import test from 'node:test';
import assert from 'node:assert/strict';

const { installOverlayExitMotion } = await import('../src/core/overlay-exit-motion.js');

// Minimal DOM: enough of Element/MutationObserver for the removal → ghost → cleanup path.
class FakeEl {
  constructor(className = '') {
    this.nodeType = 1;
    this.className = className;
    this.children = [];
    this.parentNode = null;
    this.attrs = {};
    this.styleProps = {};
    this.style = { setProperty: (k, v) => { this.styleProps[k] = v; } };
    this.classList = {
      add: c => { if (!this.className.split(' ').includes(c)) this.className = `${this.className} ${c}`.trim(); },
      contains: c => this.className.split(' ').includes(c),
    };
  }
  get isConnected() { let c = this; while (c.parentNode) c = c.parentNode; return c.isRoot === true; }
  get offsetWidth() { return 0; }
  matches(sel) { return sel.split(',').some(s => this.classList.contains(s.trim().slice(1))); }
  setAttribute(k, v) { this.attrs[k] = v; }
  contains(el) { for (let c = el; c; c = c.parentNode) if (c === this) return true; return false; }
  insertBefore(el, anchor) { el.parentNode = this; const i = anchor ? this.children.indexOf(anchor) : -1; if (i >= 0) this.children.splice(i, 0, el); else this.children.push(el); }
  appendChild(el) { this.insertBefore(el, null); }
  removeChild(el) { this.children = this.children.filter(c => c !== el); el.parentNode = null; }
}

function setup({ reduced = false } = {}) {
  const body = new FakeEl('body');
  body.isRoot = true;
  let callback = null;
  const timers = [];
  globalThis.MutationObserver = class { constructor(cb) { callback = cb; } observe() {} disconnect() {} };
  const doc = {
    body,
    addEventListener() {},
    removeEventListener() {},
    defaultView: {
      matchMedia: () => ({ matches: reduced }),
      getComputedStyle: () => ({ backgroundColor: 'rgba(20, 15, 35, 0.5)' }),
    },
  };
  const remove = (parent, el, added = []) => {
    const next = parent.children[parent.children.indexOf(el) + 1] || null;
    parent.removeChild(el);
    added.forEach(a => parent.appendChild(a));
    callback([{ target: parent, removedNodes: [el], addedNodes: added, nextSibling: next }]);
  };
  return { doc, body, remove, timers, schedule: (fn, ms) => timers.push({ fn, ms }) };
}

test('a closed overlay comes back as an inert ghost and is removed after the exit', () => {
  const { doc, body, remove, timers, schedule } = setup();
  installOverlayExitMotion(doc, { schedule, durationMs: 240 });
  const overlay = new FakeEl('modal-overlay bp-sheet-backdrop');
  body.appendChild(overlay);
  remove(body, overlay);
  assert.equal(overlay.parentNode, body);
  assert.ok(overlay.classList.contains('is-exit-ghost'));
  assert.equal(overlay.inert, true);
  assert.equal(overlay.attrs['aria-hidden'], 'true');
  assert.equal(overlay.styleProps['background-color'], 'transparent');
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 240);
  timers[0].fn();
  assert.equal(overlay.parentNode, null);
});

test('no ghost for non-overlays, reduced motion, disabled shell or a same-commit replacement', () => {
  let s = setup();
  installOverlayExitMotion(s.doc, { schedule: s.schedule });
  const card = new FakeEl('memo-card');
  s.body.appendChild(card);
  s.remove(s.body, card);
  assert.equal(card.parentNode, null);

  s = setup({ reduced: true });
  installOverlayExitMotion(s.doc, { schedule: s.schedule });
  const a = new FakeEl('modal-overlay');
  s.body.appendChild(a);
  s.remove(s.body, a);
  assert.equal(a.parentNode, null);

  s = setup();
  installOverlayExitMotion(s.doc, { schedule: s.schedule, isEnabled: () => false });
  const b = new FakeEl('modal-overlay');
  s.body.appendChild(b);
  s.remove(s.body, b);
  assert.equal(b.parentNode, null);

  s = setup();
  installOverlayExitMotion(s.doc, { schedule: s.schedule });
  const old = new FakeEl('modal-overlay');
  s.body.appendChild(old);
  s.remove(s.body, old, [new FakeEl('modal-overlay')]);
  assert.equal(old.parentNode, null);
  assert.equal(s.timers.length, 0);
});
