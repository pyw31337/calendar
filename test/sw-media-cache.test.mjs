import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import vm from 'node:vm';
import { setTimeout } from 'node:timers';
import console from 'node:console';

// Runs sw.js against in-memory Cache Storage / fetch stubs.
function loadWorker() {
  const listeners = {};
  const stores = new Map();
  const fetchCalls = [];
  const makeCache = () => {
    const map = new Map();
    return {
      map,
      match: async key => map.get(typeof key === 'string' ? key : key.url),
      put: async (key, res) => { map.set(typeof key === 'string' ? key : key.url, res); },
      keys: async () => [...map.keys()].map(url => ({ url })),
      delete: async key => map.delete(typeof key === 'string' ? key : key.url),
      add: async () => {},
    };
  };
  const caches = {
    open: async name => { if (!stores.has(name)) stores.set(name, makeCache()); return stores.get(name); },
    keys: async () => [...stores.keys()],
    delete: async name => stores.delete(name),
    match: async () => undefined,
  };
  const response = (body, init = {}) => ({
    ok: (init.status || 200) < 400,
    status: init.status || 200,
    type: init.type || 'cors',
    headers: { get: h => (init.headers || {})[h.toLowerCase()] || null },
    body,
    clone() { return this; },
  });
  const fetch = async (input, opts = {}) => {
    fetchCalls.push({ url: typeof input === 'string' ? input : input.url, mode: opts.mode });
    return response('bytes', { headers: { 'content-length': '1000' } });
  };
  const self = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    location: { origin: 'https://pyw31337.github.io' },
    skipWaiting() {},
    clients: { claim() {} },
  };
  vm.runInNewContext(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), {
    self, caches, fetch, URL, console, Response: { error: () => response(null, { status: 0 }) },
  });
  const request = (url, { destination = 'image', range = false } = {}) => ({
    url,
    method: 'GET',
    mode: 'no-cors',
    destination,
    headers: { get: h => (h === 'accept' ? 'image/*' : null), has: h => (h === 'range' ? range : false) },
  });
  const dispatch = async req => {
    let responded = null;
    listeners.fetch({ request: req, respondWith: p => { responded = p; } });
    return responded ? await responded : null;
  };
  return { dispatch, request, fetchCalls, stores };
}

const IMG = 'https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/chatImages%2Fcal_x%2Fa_thumb_1b.webp?alt=media&token=t';

test('storage images are fetched once in CORS mode, then served from the media cache', async () => {
  const w = loadWorker();
  const first = await w.dispatch(w.request(IMG));
  assert.equal(first.status, 200);
  assert.deepEqual(w.fetchCalls, [{ url: IMG, mode: 'cors' }]);
  await new Promise(resolve => setTimeout(resolve, 0));
  const second = await w.dispatch(w.request(IMG));
  assert.equal(second.status, 200);
  assert.equal(w.fetchCalls.length, 1, 'second view costs no download');
  assert.ok(w.stores.get('moyeora-media-v1').map.has(IMG));
});

test('video range requests and non-storage URLs are left to the network', async () => {
  const w = loadWorker();
  assert.equal(await w.dispatch(w.request(IMG, { range: true })), null);
  assert.equal(await w.dispatch(w.request(IMG, { destination: 'video' })), null);
  assert.equal(await w.dispatch(w.request('https://example.com/a.png')), null);
  assert.equal(w.fetchCalls.length, 0);
});
