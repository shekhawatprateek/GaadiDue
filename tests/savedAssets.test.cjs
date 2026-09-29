const assert = require('node:assert/strict');
const test = require('node:test');
const { removeLegacyDemoDates } = require('../src/savedAssets.ts');

test('removes fabricated dates from older numbers while retaining explicit samples', () => {
  const oldRecord = { id: 'old', kind: 'vehicle', identifier: 'DL01AB1234', label: 'Car', source: 'demo', checkedAt: '2026-09-23T10:00:00.000Z', records: [{ kind: 'puc', validUntil: '2026-10-05' }] };
  const sample = { ...oldRecord, id: 'sample', identifier: 'DEMOCAR001' };
  const result = removeLegacyDemoDates([oldRecord, sample]);
  assert.equal(result.changed, true);
  assert.deepEqual(result.assets[0], { ...oldRecord, source: 'pending', checkedAt: '', records: [] });
  assert.deepEqual(result.assets[1], sample);
});
