const assert = require('node:assert/strict');
const test = require('node:test');
const { daysUntil, planReminders } = require('../src/reminders.ts');

const now = new Date(2026, 8, 23, 8, 0, 0);

function asset(records) {
  return {
    id: 'vehicle-1',
    kind: 'vehicle',
    identifier: 'DL01AB1234',
    label: 'Family car',
    records,
    checkedAt: now.toISOString(),
    source: 'demo',
  };
}

test('calendar-day difference uses local dates', () => {
  assert.equal(daysUntil('2026-09-24', now), 1);
  assert.equal(daysUntil('2026-09-23', now), 0);
  assert.equal(daysUntil('2026-09-20', now), -3);
  assert.equal(daysUntil('2026-02-30', now), null);
});

test('schedules repeated reminders and skips lifetime tax', () => {
  const reminders = planReminders([asset([
    { kind: 'puc', validUntil: '2026-10-23' },
    { kind: 'tax', validUntil: null, note: 'Lifetime' },
  ])], now);
  assert.deepEqual(reminders.map((item) => item.daysBefore), [30, 14, 7, 1, 0]);
  assert.ok(reminders.every((item) => item.documentKind === 'puc'));
});

test('a renewed expiry replaces the old reminder dates', () => {
  const before = planReminders([asset([{ kind: 'insurance', validUntil: '2026-10-05' }])], now);
  const after = planReminders([asset([{ kind: 'insurance', validUntil: '2027-10-05' }])], now);
  assert.ok(before.length > 0);
  assert.ok(after.length > 0);
  assert.ok(after.every((item) => item.when > before[before.length - 1].when));
});

test('a number awaiting live lookup never schedules expiry reminders', () => {
  const pending = {
    ...asset([{ kind: 'puc', validUntil: '2026-10-23' }]),
    source: 'pending',
  };
  assert.deepEqual(planReminders([pending], now), []);
});
