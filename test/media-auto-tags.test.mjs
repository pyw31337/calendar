import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const register = require('../functions/test/media-auto-tags.contract.cjs');

// Transaction contract double: all reads precede writes, exceptions commit nothing. The same
// suite is also wired into the real emulator command; this double does not claim concurrency QA.
function createDb() {
  const records = new Map();
  const clone = value => value === undefined ? undefined : structuredClone(value);
  const snap = ref => ({ exists: records.has(ref.path), ref, id: ref.id, data: () => clone(records.get(ref.path)) });
  const collection = path => ({ id: path.split('/').pop(), doc: id => document(`${path}/${id}`) });
  const document = path => ({ path, id: path.split('/').pop(), parent: collection(path.split('/').slice(0, -1).join('/')),
    collection: id => collection(`${path}/${id}`), get: async () => snap(document(path)),
    set: async (data, options) => records.set(path, options?.merge ? { ...records.get(path), ...clone(data) } : clone(data)),
    update: async data => { assert.ok(records.has(path)); records.set(path, { ...records.get(path), ...clone(data) }); }
  });
  return { collection, runTransaction: async callback => {
    const writes = [];
    const result = await callback({
      get: async ref => { assert.equal(writes.length, 0, 'Firestore prohibits reads after writes'); return snap(ref); },
      set: (ref, data, options) => writes.push(() => ref.set(data, options)),
      update: (ref, data) => writes.push(() => ref.update(data))
    });
    for (const write of writes) await write();
    return result;
  } };
}
register(createDb);
