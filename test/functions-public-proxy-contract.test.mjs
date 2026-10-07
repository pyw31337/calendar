import test from 'node:test';
import assert from 'node:assert/strict';
import proxyContract from '../functions/public-proxy-contract.js';

const { parsePublicHttpUrl, setPublicCacheHeaders } = proxyContract;

test('public proxy accepts ordinary web URLs and rejects SSRF/private targets', () => {
  assert.equal(parsePublicHttpUrl('https://example.com/path?q=1')?.hostname, 'example.com');
  for (const unsafe of [
    'file:///etc/passwd', 'http://127.0.0.1:8080/', 'http://10.0.0.1/',
    'http://172.20.0.4/', 'http://192.168.0.1/', 'http://169.254.169.254/',
    'https://metadata.google.internal/', 'https://user:password@example.com/', 'not a url'
  ]) assert.equal(parsePublicHttpUrl(unsafe), null, unsafe);
});

test('public proxy cache policy is bounded and type-safe', () => {
  const headers = new Map();
  setPublicCacheHeaders({ set: (name, value) => headers.set(name, value) }, 60);
  assert.equal(headers.get('Cache-Control'), 'public, max-age=60, stale-while-revalidate=60');
  assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
});
