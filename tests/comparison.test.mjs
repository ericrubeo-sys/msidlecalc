import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareItems, parseStat, STAT_DEFINITIONS } from '../public/domain/comparison.js';
const item = (stats) => ({ stats });
const context = { activity: 'boss' };

test('raw differences never imply a damage winner, even if every supplied stat rises', () => {
  const result = compareItems(item({ attack: 1, criticalRate: 4 }), item({ attack: 1000, criticalRate: 8 }), context);
  assert.equal(result.rows[0].difference, 999);
  assert.equal(result.rows[2].difference, 4);
  assert.deepEqual(result.damage, { status: 'unavailable', confidence: 'Low', winner: null, percentChange: null, modelVersion: 'unvalidated-0' });
});
test('missing lines remain unknown while explicit zero can be compared', () => {
  const result = compareItems(item({ attack: '', criticalDamage: 0 }), item({ attack: 10, criticalDamage: 8 }), context);
  assert.equal(result.rows[0].difference, null);
  assert.equal(result.rows[3].difference, 8);
  assert.equal(result.comparableCount, 1);
});
test('swapping items reverses differences, equal values stay equal, and context adds no guessed scaling', () => {
  const a = item({ attack: 10.5, mainStat: 20 });
  const b = item({ attack: 12.75, mainStat: 20 });
  const forward = compareItems(a, b, context);
  const reverse = compareItems(b, a, { activity: 'chapter' });
  assert.equal(forward.rows[0].difference, -reverse.rows[0].difference);
  assert.equal(forward.rows[1].difference, 0);
  assert.deepEqual(compareItems(a, b, { activity: 'chapter' }).rows, forward.rows);
});
test('reject malformed, negative, nonfinite, unsafe, or fractional skill-level values', () => {
  for (const value of ['bad', -1, Infinity, Number.MAX_SAFE_INTEGER + 1, {}]) {
    assert.throws(() => parseStat(value, STAT_DEFINITIONS[0]));
  }
  assert.throws(() => parseStat('1.5', STAT_DEFINITIONS[5]));
  assert.equal(parseStat(' ', STAT_DEFINITIONS[0]), null);
  assert.equal(parseStat('0', STAT_DEFINITIONS[0]), 0);
});
