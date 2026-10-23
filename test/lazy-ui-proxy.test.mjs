import test from 'node:test';
import assert from 'node:assert/strict';

const { registerLazyUiComponents, stableUiComponent } = await import('../src/core/lazy-ui-proxy.js');
const fakeReact = { useState: v => [typeof v === 'function' ? v() : v, () => {}], useEffect: () => {}, createElement: (C, p) => ({ C, p }) };

test('placeholders are registered only for missing components and prefetch loads each chunk once', async () => {
  const target = { GATHER_UI_COMPONENTS: { Lightbox: function RealLightbox() {} } };
  let loads = 0;
  const prefetch = registerLazyUiComponents(fakeReact, {
    dateModal: { load: async () => { loads += 1; target.GATHER_UI_COMPONENTS = { ...target.GATHER_UI_COMPONENTS, DateModal: function RealDateModal() {} }; }, components: ['DateModal'] },
    lightbox: { load: async () => { loads += 1; }, components: ['Lightbox'] }
  }, target);
  assert.equal(target.GATHER_UI_COMPONENTS.DateModal.__lazyUiProxy, true);
  assert.equal(target.GATHER_UI_COMPONENTS.Lightbox.name, 'RealLightbox');
  await prefetch();
  await prefetch();
  assert.equal(loads, 2);
  assert.equal(target.GATHER_UI_COMPONENTS.DateModal.name, 'RealDateModal');
});

test('a proxy rendered after its chunk registered renders the real component', () => {
  const target = { GATHER_UI_COMPONENTS: {} };
  registerLazyUiComponents(fakeReact, { d: { load: async () => {}, components: ['DateModal'] } }, target);
  const Proxy = target.GATHER_UI_COMPONENTS.DateModal;
  function RealDateModal() {}
  target.GATHER_UI_COMPONENTS.DateModal = RealDateModal;
  const out = Proxy({ isOpen: true });
  assert.equal(out.C, RealDateModal);
  assert.deepEqual(out.p, { isOpen: true });
});

test('a placeholder handed out once keeps being handed out after its chunk registers', () => {
  // The date popup opened right after app start rendered the placeholder; a re-render a second
  // later looked the name up again, got the real component (a different type) and React threw the
  // open popup away. The same placeholder must come back so the open popup stays mounted.
  const target = { GATHER_UI_COMPONENTS: {} };
  registerLazyUiComponents(fakeReact, { d: { load: async () => {}, components: ['StablePopup'] } }, target);
  const placeholder = stableUiComponent('StablePopup', target.GATHER_UI_COMPONENTS);
  assert.equal(placeholder.__lazyUiProxy, true);
  function RealPopup() {}
  target.GATHER_UI_COMPONENTS = { ...target.GATHER_UI_COMPONENTS, StablePopup: RealPopup };
  assert.equal(stableUiComponent('StablePopup', target.GATHER_UI_COMPONENTS), placeholder);
  assert.equal(placeholder({}).C, RealPopup, 'the placeholder renders the real component');
});

test('a component first looked up after its chunk loaded is used directly', () => {
  function RealSheet() {}
  assert.equal(stableUiComponent('LoadedSheet', { LoadedSheet: RealSheet }), RealSheet);
  assert.equal(stableUiComponent('MissingSheet', {}), undefined);
});
