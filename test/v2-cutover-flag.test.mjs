import test from 'node:test';
import assert from 'node:assert/strict';
import { isRenewalShellEnabled } from '../src/core/app-feature-flags.js';

const originalWindow = globalThis.window;

test('V2 cutover flag remains explicitly reversible through the URL', () => {
  try {
    globalThis.window = { location: { search: '?id=cw&shell=v2' } };
    assert.equal(isRenewalShellEnabled(), true);

    globalThis.window = { location: { search: '?id=cw&shell=v1' } };
    assert.equal(isRenewalShellEnabled(), false);

    // No deployment variable is present in the Node test environment, so the normal build
    // remains V1 until a release deliberately sets VITE_DEFAULT_SHELL=v2.
    globalThis.window = { location: { search: '?id=cw' } };
    assert.equal(isRenewalShellEnabled(), false);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
