// Synthetic arithmetic fixtures, not real-player data or live-game validation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MULTIPLIER_IDS, calculateOrdinaryOutcome, expectedOrdinaryDamage, compareOrdinaryStates, compareSupportedFactors, pvpDefenderLevelRatio } from '../public/domain/damage-model.js';

const outcome = (probability = 1, criticalMultiplier = 1) => ({ probability, criticalMultiplier, rangeMultiplier: 1, statusMultiplier: 1 });
const state = attack => ({ attack, targetDefense: 0, defensePenetration: 0, multipliers: Object.fromEntries(MULTIPLIER_IDS.map(id => [id, 1])) });

test('MSI-G15-DEFENSE: zero defense retains 5000/6000 mitigation', () => {
  assert.equal(calculateOrdinaryOutcome(state(600), outcome()), 500);
  const penetrated = { ...state(600), targetDefense: 100000, defensePenetration: 1 };
  assert.equal(calculateOrdinaryOutcome(penetrated, outcome()), 500);
});

test('MSI-G15-DAMAGE-ORDER: explicit separate factors, crit and status eligibility', () => {
  const s = state(600);
  s.multipliers.damage = 1.5;
  s.multipliers.damageAmplification = 2;
  s.multipliers.finalDamage = 1.56;
  assert.equal(calculateOrdinaryOutcome(s, { ...outcome(), criticalMultiplier: 3, statusMultiplier: 1.2 }), 8424);
});

test('MSI-G15-CRITICAL: explicit joint outcomes, no hidden distribution or crit cap', () => {
  assert.equal(expectedOrdinaryDamage(state(600), [outcome(.75), outcome(.25, 3)]), 750);
  assert.throws(() => expectedOrdinaryDamage(state(600), [outcome(.2)]), RangeError);
  assert.throws(() => calculateOrdinaryOutcome(state(600), { criticalMultiplier: 1 }), RangeError);
});

test('incomplete and named modes never produce equipment/DPS verdicts', () => {
  const input = { current: state(600), candidate: state(660), currentOutcomes: [outcome()], candidateOutcomes: [outcome()], unsupportedEffects: ['unmapped-line'], completeEffectsConfirmed: true, contextId: 'ordinary-before-content' };
  const result = compareOrdinaryStates(input);
  assert.equal(result.status, 'partial');
  assert.equal(result.damage.winner, null);
  assert.ok(result.issues.includes('unsupported-changed-effects'));
  assert.ok(Math.abs(result.factors[0].percentChange - 10) < 1e-10);
  for (const contextId of ['chapter', 'zakum', 'guild-training', 'arena', undefined]) {
    const rejected = compareOrdinaryStates({ ...input, contextId });
    assert.equal(rejected.status, 'unsupported');
    assert.deepEqual(rejected.factors, []);
    assert.equal(rejected.damage.winner, null);
  }
});

test('partial factors preserve equal/swapped reciprocal algebra and cannot rank gear', () => {
  const compare = (a, b) => compareSupportedFactors({ factors: [{ id: 'attack', current: a, candidate: b }], unsupportedEffects: [] });
  assert.equal(compare(100, 100).combinedFactor.ratio, 1);
  assert.equal(compare(100, 200).combinedFactor.ratio * compare(200, 100).combinedFactor.ratio, 1);
  assert.equal(compare(100, 200).damage.winner, null);
  assert.equal(compare(100, 200).status, 'partial');
  const buckets = compareSupportedFactors({ factors: [{ id: 'damage', current: 1.5, candidate: 1.6 }, { id: 'finalDamage', current: 1.56, candidate: 1.82 }], unsupportedEffects: ['mainStat'] });
  assert.ok(Math.abs(buckets.combinedFactor.ratio - (1.6 / 1.5) * (1.82 / 1.56)) < 1e-12);
});

test('invalid, unknown, duplicate, overflow and underflow do not escape as numbers', () => {
  for (const factors of [[], [{ id: 'mainStat', current: 1, candidate: 2 }], [{ id: 'attack', current: 0, candidate: 1 }], [{ id: 'attack', current: null, candidate: 1 }], [{ id: 'attack', current: 1, candidate: Infinity }], [{ id: 'attack', current: 1, candidate: Number.MAX_VALUE }], [{ id: 'attack', current: Number.MAX_VALUE, candidate: Number.MIN_VALUE }], [{ id: 'attack', current: 1, candidate: 2 }, { id: 'attack', current: 1, candidate: 2 }]]) {
    const result = compareSupportedFactors({ factors, unsupportedEffects: [] });
    assert.equal(result.status, 'unsupported');
    assert.equal(result.combinedFactor, null);
    assert.equal(result.damage.winner, null);
  }
  assert.throws(() => calculateOrdinaryOutcome({ ...state(1), multipliers: { ...state(1).multipliers, mystery: 1 } }, outcome()), TypeError);
});

test('MSI-G15-PVP-LEVEL: relative defender-level bands multiply per gained level', () => {
  const level = (mode, fromLevel, toLevel) => pvpDefenderLevelRatio({ mode, fromLevel, toLevel });
  assert.equal(level('arena', 30, 31), .995);
  assert.equal(level('arena', 60, 61), .987);
  assert.equal(level('world-arena', 100, 101), .985);
  assert.equal(level('colosseum', 70, 71), .985);
  assert.equal(level('colosseum', 100, 101), .975);
  assert.equal(level('colosseum', 69, 71), .987 * .985);
  assert.equal(level('arena', 30, 30), 1);
  assert.ok(Math.abs(level('arena', 30, 99) - .995 ** 30 * .987 ** 39) < 1e-12);
  assert.ok(Math.abs(level('arena', 30, 99) * level('arena', 99, 30) - 1) < 1e-12);
  for (const mode of ['arena', 'world-arena', 'colosseum']) {
    const at100 = mode === 'colosseum' ? .985 : .987;
    const at101 = mode === 'colosseum' ? .975 : .985;
    assert.equal(level(mode, 99, 100), at100);
    assert.equal(level(mode, 100, 99), 1 / at100);
    assert.equal(level(mode, 99, 101), at100 * at101);
    assert.ok(Math.abs(level(mode, 30, 101) * level(mode, 101, 30) - 1) < 1e-12);
    assert.equal(level(mode, 100, 100), 1);
  }
  for (const input of [{ mode: 'chapter', fromLevel: 30, toLevel: 31 }, { mode: 'arena', fromLevel: 29, toLevel: 31 }, { mode: 'arena', fromLevel: 30, toLevel: 31.5 }, { mode: 'arena', fromLevel: 30, toLevel: Number.MAX_SAFE_INTEGER }]) assert.throws(() => pvpDefenderLevelRatio(input));
});
