import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { installAppServiceWorker, resolveServiceWorkerTarget } from '../src/core/service-worker-registration.js';

const source = readFileSync(new URL('../src/core/service-worker-registration.js', import.meta.url), 'utf8');

test('pages, bare /calendar, app scope, and local root each get a real sw.js', () => {
  assert.deepEqual(resolveServiceWorkerTarget('/calendar/'), {
    scriptUrl: '/calendar/sw.js',
    scope: '/calendar/'
  });
  assert.deepEqual(resolveServiceWorkerTarget('/calendar'), {
    scriptUrl: '/calendar/sw.js',
    scope: '/calendar/'
  });
  assert.deepEqual(resolveServiceWorkerTarget('/calendar/app/cw/'), {
    scriptUrl: '/calendar/sw.js',
    scope: '/calendar/'
  });
  assert.deepEqual(resolveServiceWorkerTarget('/'), {
    scriptUrl: '/sw.js',
    scope: '/'
  });
  assert.deepEqual(resolveServiceWorkerTarget('/index.html'), {
    scriptUrl: '/sw.js',
    scope: '/'
  });
});

test('a missing worker is unregistered and never registered again', async () => {
  const unregistered = [];
  const registered = [];
  const deleted = [];
  const registration = await installAppServiceWorker({
    pathname: '/calendar/app/cw/',
    fetchImpl: async () => ({ ok: false, status: 404, headers: { get: () => 'text/html' } }),
    cachesApi: {
      keys: async () => ['moyeora-static-old', 'moyeora-media-v1'],
      delete: async name => { deleted.push(name); return true; }
    },
    serviceWorker: {
      register: async url => { registered.push(url); return {}; },
      getRegistrations: async () => [{
        active: { scriptURL: 'https://pyw31337.github.io/calendar/sw.js' },
        unregister: async () => { unregistered.push('sw'); return true; }
      }]
    }
  });
  assert.equal(registration, null);
  assert.deepEqual(registered, []);
  assert.deepEqual(unregistered, ['sw']);
  assert.deepEqual(deleted, ['moyeora-static-old']);
});

test('offline probe keeps the current worker', async () => {
  const unregistered = [];
  const registration = await installAppServiceWorker({
    pathname: '/calendar/',
    fetchImpl: async () => { throw new Error('offline'); },
    serviceWorker: {
      register: async () => { throw new Error('should not register'); },
      getRegistrations: async () => [{
        active: { scriptURL: 'https://pyw31337.github.io/calendar/sw.js' },
        unregister: async () => { unregistered.push('sw'); }
      }]
    }
  });
  assert.equal(registration, null);
  assert.deepEqual(unregistered, []);
});

test('a good script registers once and a rejected update does not surface', async () => {
  const updates = [];
  const registration = await installAppServiceWorker({
    pathname: '/calendar/',
    fetchImpl: async () => ({ ok: true, status: 200, headers: { get: () => 'application/javascript; charset=utf-8' } }),
    serviceWorker: {
      register: async (url, options) => {
        assert.equal(url, '/calendar/sw.js');
        assert.equal(options.scope, '/calendar/');
        return { update: () => { updates.push('update'); return Promise.reject(new Error('Script /calendar/sw.js load failed')); } };
      }
    }
  });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(typeof registration.update, 'function');
  assert.deepEqual(updates, ['update']);
});

test('update rejections are not left unhandled in the source', () => {
  assert.match(source, /Promise\.resolve\(registration\.update\(\)\)\.catch/);
  assert.doesNotMatch(source, /try \{ reg\.update\(\) \}/);
});
