import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeRate, orderedAttribute, remainingCapAggregate,
  replaceRemainingCapSource, finalDamageMultiplier, replaceFinalDamageSource,
  ordinaryDefenseFactor, expectedTransformedDamage, relativeImpact,
} from '../public/domain/mechanics.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('R2: flat contributions are replaced before ordinary and skill multipliers', () => {
  const common = { bonusRates: [.5], skillBonusRates: [.2], skillFlatSources: [5] };
  close(orderedAttribute({ ...common, flatSources: [100, 10] }), 203);
  close(orderedAttribute({ ...common, flatSources: [100, 20] }), 221);
});

test('R3/R4: capped-fill replacement reaggregates known sources and does not infer from saturated totals', () => {
  close(remainingCapAggregate([.5, .2], 1), .6);
  close(replaceRemainingCapSource([.5], .4, 1), .7);
  close(remainingCapAggregate([1, .2], 1), 1);
  close(remainingCapAggregate([1, .8], 1), 1);
  assert.notEqual(replaceRemainingCapSource([.2], .4, 1), replaceRemainingCapSource([.8], .4, 1));
  assert.throws(() => replaceRemainingCapSource(null, .4, 1));
  assert.throws(() => remainingCapAggregate([1.1], 1));
  close(remainingCapAggregate([.3], 1.5), .3);
  close(remainingCapAggregate([.3, .3], 1.5), .54);
});

test('R6: Final Damage replacement divides old source before multiplying the new one', () => {
  close(finalDamageMultiplier([.3, .2]), 1.56);
  close(replaceFinalDamageSource(1.56, .2, .4), 1.82);
  assert.throws(() => replaceFinalDamageSource(1.1, .5, .2));
  assert.throws(() => replaceFinalDamageSource(1, 5e-13, 0));
});

test('R7/R8: explicit percentage scales and the non-unit zero-defense factor', () => {
  close(normalizeRate(30, 'displayPercent'), normalizeRate(300, 'internalPermille'));
  close(normalizeRate(.3, 'fraction'), .3);
  assert.throws(() => normalizeRate(30, 'guess'));
  close(ordinaryDefenseFactor(0, 0), 5 / 6);
  close(ordinaryDefenseFactor(20000, 1), 5 / 6);
  close(ordinaryDefenseFactor(0, .5), ordinaryDefenseFactor(0, 0));
  assert.throws(() => ordinaryDefenseFactor(100, 1.1));
});

test('E1/E2: average transformed branches; skill coefficient is outside the mode transform', () => {
  const amount = (outcomes, exponent = .5, skillCoefficient = 1) => expectedTransformedDamage({ outcomes, exponent, skillCoefficient });
  const a = [{ probability: 1, preTransformDamage: 230 }];
  const b = [{ probability: .5, preTransformDamage: 100 }, { probability: .5, preTransformDamage: 400 }];
  close(amount(b), 15);
  assert.ok(amount(a) > amount(b));
  assert.ok(Math.sqrt(250) > Math.sqrt(230)); // Deliberately wrong order reverses the winner.
  close(amount([{ probability: 1, preTransformDamage: 100 }], .5, 4), 40);
  close(amount([{ probability: 1, preTransformDamage: 27 }], 1 / 3, 2), 6);
  assert.throws(() => amount([{ probability: .4, preTransformDamage: 100 }]));
  assert.throws(() => amount([]));
});

test('G1: swapped ratios are reciprocal, percentages are not negatives, and zero baselines abstain', () => {
  const a = relativeImpact(100, 125);
  const b = relativeImpact(125, 100);
  close(a.ratio * b.ratio, 1);
  close(a.percentChange, 25);
  close(b.percentChange, -20);
  close(relativeImpact(100, 100).percentChange, 0);
  assert.equal(relativeImpact(0, 10).percentChange, null);
  assert.throws(() => relativeImpact(Infinity, 10));
  assert.throws(() => relativeImpact(1, Number.MAX_VALUE));
});
