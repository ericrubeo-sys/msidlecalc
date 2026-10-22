// Independent numerical-boundary fixtures. These are synthetic values, not game
// measurements, caps or a validation of a complete encounter/DPS model.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EVIDENCE, normalizeRate, orderedAttribute, remainingCapAggregate, replaceRemainingCapSource, finalDamageMultiplier, replaceFinalDamageSource, expectedTransformedDamage, relativeImpact } from '../public/domain/mechanics.js';

test('QA direct normalization and ordered additive-bonus stages reject positive input collapsing to zero effect', () => {
  assert.throws(() => normalizeRate(Number.MIN_VALUE, 'displayPercent'), /underflow/i);
  assert.throws(() => normalizeRate(Number.MIN_VALUE, 'internalPermille'), /underflow/i);
  assert.equal(normalizeRate(0, 'displayPercent'), 0);
  assert.equal(normalizeRate(Number.MIN_VALUE, 'fraction'), Number.MIN_VALUE);
  assert.equal(normalizeRate(30, 'displayPercent'), .3);
  const input = { flatSources: [100], bonusRates: [], skillBonusRates: [], skillFlatSources: [] };
  assert.equal(orderedAttribute(input), 100);
  assert.throws(() => orderedAttribute({ ...input, bonusRates: [1e-20] }), /precision/i);
  assert.throws(() => orderedAttribute({ ...input, skillBonusRates: [1e-20] }), /precision/i);
  assert.equal(orderedAttribute({ ...input, bonusRates: [.5], skillBonusRates: [.2], skillFlatSources: [5] }), 185);
});

test('QA direct cap helper preserves tiny absolute rates, neutral +0 and nonunit-cap units', () => {
  assert.equal(remainingCapAggregate([1e-20], 1), 1e-20);
  const small = remainingCapAggregate([1e-20], 1.5);
  assert.ok(Math.abs(small / 1e-20 - 1) < 1e-12);
  const neutral = remainingCapAggregate([], 1.5);
  assert.equal(neutral, 0); assert.equal(Object.is(neutral, -0), false);
  assert.ok(Math.abs(remainingCapAggregate([.3, .3], 1.5) - .54) < 1e-12);
  assert.ok(Math.abs(replaceRemainingCapSource([.5], .4, 1) - .7) < 1e-12);
});

test('QA saturated cap validates every source first and rejects unrepresentable normalization', () => {
  for (const invalid of [NaN, Infinity, -1, 1.1, null]) assert.throws(() => remainingCapAggregate([1, invalid], 1));
  assert.equal(remainingCapAggregate([1, .2, 0], 1), 1);
  assert.throws(() => remainingCapAggregate([Number.MIN_VALUE], Number.MAX_VALUE), /underflow/i);
  for (const cap of [0, -1, NaN, Infinity]) assert.throws(() => remainingCapAggregate([], cap));
});

test('QA direct FD aggregate and replacement reject subprecision bonuses and overflow consistently', () => {
  assert.equal(finalDamageMultiplier([]), 1);
  assert.equal(finalDamageMultiplier([0]), 1);
  assert.ok(Math.abs(finalDamageMultiplier([.2, .3]) - 1.56) < 1e-12);
  assert.ok(Math.abs(replaceFinalDamageSource(1.56, .2, .4) - 1.82) < 1e-12);
  assert.throws(() => finalDamageMultiplier([1e-20]), /precision/i);
  assert.throws(() => replaceFinalDamageSource(1, 1e-20, 0), /precision/i);
  assert.throws(() => replaceFinalDamageSource(1, 0, 1e-20), /precision/i);
  assert.throws(() => finalDamageMultiplier([Number.MAX_VALUE, 1]));
  assert.throws(() => replaceFinalDamageSource(Number.MAX_VALUE, 0, 1));
});

test('QA direct expected-outcome helper rejects weighted underflow/overflow while permitting true zero outcomes', () => {
  const run = (outcomes, skillCoefficient = 1) => expectedTransformedDamage({ outcomes, exponent: 1, skillCoefficient });
  assert.throws(() => run([{ probability: Number.MIN_VALUE, preTransformDamage: 1e-300 }, { probability: 1, preTransformDamage: 0 }]), /underflow/i);
  assert.throws(() => run([{ probability: 1, preTransformDamage: Number.MAX_VALUE }], 2));
  assert.equal(run([{ probability: 0, preTransformDamage: Number.MAX_VALUE }, { probability: 1, preTransformDamage: 0 }], Number.MAX_VALUE), 0);
  assert.equal(run([{ probability: 1, preTransformDamage: 100 }], 0), 0);
  assert.equal(run([{ probability: .5, preTransformDamage: 100 }, { probability: .5, preTransformDamage: 200 }], 2), 300);
});

test('QA direct relative helper distinguishes impossible numerical ratios from actual zero candidate/baseline', () => {
  assert.throws(() => relativeImpact(Number.MAX_VALUE, Number.MIN_VALUE), /underflow/i);
  assert.throws(() => relativeImpact(1, Number.MAX_VALUE));
  assert.deepEqual(relativeImpact(10, 0), { ratio: 0, percentChange: -100, reason: null });
  assert.deepEqual(relativeImpact(0, 10), { ratio: null, percentChange: null, reason: 'zero-baseline' });
  assert.equal(relativeImpact(1e-200, 2e-200).ratio * relativeImpact(2e-200, 1e-200).ratio, 1);
  assert.equal(relativeImpact(10, 10).percentChange, 0);
});

test('QA numerical guard revision remains isolated and empirically unvalidated', () => {
  assert.equal(EVIDENCE.version, 'published-rules-2026-10-15-v2');
  assert.equal(EVIDENCE.implementationScope, 'isolated-primitives');
  assert.equal(EVIDENCE.empiricalValidation, 'not-performed');
  assert.equal(EVIDENCE.gameBuild, null);
});
