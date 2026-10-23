// Independent QA: invented algebra fixtures, never measured player/game data.
// Primary claims: https://maplestoryidle.nexon.com/en/guide Battle §§1.1–1.3,
// 2.1 and Dictionary. Constants/distributions here are explicitly synthetic.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAIMS } from '../public/domain/mechanics-data.js';
import { MULTIPLIER_IDS, calculateOrdinaryOutcome, expectedOrdinaryDamage, compareOrdinaryStates, compareSupportedFactors, pvpDefenderLevelRatio } from '../public/domain/damage-model.js';
import { replaceAttributeSources, replaceFinalDamageSources, replaceFinalDamageFromTotal, replaceRemainingCapSources, invertRemainingCapReplacement } from '../public/domain/reaggregation.js';
import { expectedTransformedDamage } from '../public/domain/mechanics.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * 1e-12, `${actual} != ${expected}`);
const state = (attack = 120, extras = {}) => ({ attack, targetDefense: 0, defensePenetration: 0, multipliers: Object.fromEntries(MULTIPLIER_IDS.map(id => [id, 1])), ...extras });
const outcome = (extras = {}) => ({ probability: 1, criticalMultiplier: 1, rangeMultiplier: 1, statusMultiplier: 1, ...extras });
const compare = (current, candidate, extras = {}) => compareOrdinaryStates({ current, candidate, currentOutcomes: [outcome()], candidateOutcomes: [outcome()], contextId: 'ordinary-before-content', unsupportedEffects: [], completeEffectsConfirmed: true, ...extras });

test('QA source links distinguish publication, implementation and empirical validation', () => {
  for (const claim of Object.values(CLAIMS)) {
    assert.ok(['https://maplestoryidle.nexon.com/en/guide', 'https://maplestoryidle.nexon.com/en/qna'].includes(claim.source.url));
    assert.ok(claim.source.section);
    assert.equal(claim.source.build, null);
    assert.equal(claim.confidence.empirical, 'not-validated');
    assert.notEqual(claim.confidence.prediction, 'High');
  }
  assert.equal(CLAIMS['MSI-G15-CONTEXT'].confidence.implementation, 'named-profiles-not-implemented');
  assert.equal(CLAIMS['MSI-Q22-TRIGGERS'].confidence.implementation, 'not-implemented');
});

test('QA ATTRIBUTE-ORDER replaces raw flat source before unchanged multipliers', () => {
  const result = replaceAttributeSources({ sources: [
    { id: 'unchanged', stage: 'flat', value: 100 }, { id: 'old', stage: 'flat', value: 10 },
    { id: 'ordinary', stage: 'ordinaryMultiplier', value: 1.5 },
    { id: 'skill', stage: 'skillMultiplier', value: 1.2 }, { id: 'skill-flat', stage: 'skillFlat', value: 5 },
  ], oldSourceIds: ['old'], candidateSources: [{ id: 'new', stage: 'flat', value: 20 }] });
  close(result.before, 203); close(result.after, 221);
  assert.notEqual(result.after, result.before + 10);
  assert.ok(result.claimIds.includes('MSI-G15-ATTRIBUTE-ORDER'));
  assert.deepEqual(result.sourceIds.after, ['unchanged', 'ordinary', 'skill', 'skill-flat', 'new']);
});

test('QA source replacement rejects nonexistent, duplicated and ambiguous-stage records', () => {
  for (const input of [
    { sources: [{ id: 'x', value: .2 }], oldSourceIds: ['missing'], candidateSources: [] },
    { sources: [{ id: 'x', value: .2 }, { id: 'x', value: .3 }], oldSourceIds: ['x'], candidateSources: [] },
    { sources: [{ id: 'x', value: .2 }], oldSourceIds: [], candidateSources: [{ id: 'x', value: .3 }] },
  ]) assert.throws(() => replaceFinalDamageSources(input));
  assert.throws(() => replaceAttributeSources({ sources: [{ id: 'raw', stage: 'ordinaryMultiplier', value: .1 }], oldSourceIds: [], candidateSources: [] }));
});

test('QA FINAL-DAMAGE replacement preserves independent unchanged sources', () => {
  const before = [{ id: 'other', value: .3 }, { id: 'old', value: .2 }];
  const forward = replaceFinalDamageSources({ sources: before, oldSourceIds: ['old'], candidateSources: [{ id: 'new', value: .4 }] });
  close(forward.before, 1.56); close(forward.after, 1.82);
  const reverse = replaceFinalDamageSources({ sources: [{ id: 'other', value: .3 }, { id: 'new', value: .4 }], oldSourceIds: ['new'], candidateSources: [{ id: 'old', value: .2 }] });
  close(reverse.before, forward.after); close(reverse.after, forward.before);
});

test('QA REMAINING-CAP nonunit replacement and inverse use absolute rate units', () => {
  const result = replaceRemainingCapSources({ sources: [{ id: 'other', value: .5 }, { id: 'old', value: .3 }], oldSourceIds: ['old'], candidateSources: [{ id: 'new', value: .6 }], cap: 1.5 });
  close(result.before, .7); close(result.after, .9);
  const inverse = invertRemainingCapReplacement({ total: .7, oldSource: .3, newSource: .6, cap: 1.5, totalIsExact: true });
  close(inverse.unchanged, .5); close(inverse.after, .9);
});

test('QA REMAINING-CAP refuses saturated, rounded and impossible inverses', () => {
  const valid = { total: .6, oldSource: .2, newSource: .4, cap: 1, totalIsExact: true };
  for (const overrides of [{ total: 1 }, { oldSource: 1 }, { totalIsExact: false }, { total: .1 }, { cap: 0 }, { newSource: 1.1 }, { oldSource: .999999999, total: .9999999995 }]) {
    assert.throws(() => invertRemainingCapReplacement({ ...valid, ...overrides }));
  }
});

test('QA DEFENSE ordinary zero-defense stage retains 5000/6000 mitigation', () => {
  close(calculateOrdinaryOutcome(state(), outcome()), 100);
  close(calculateOrdinaryOutcome(state(120, { targetDefense: 100000, defensePenetration: 1 }), outcome()), 100);
  assert.throws(() => calculateOrdinaryOutcome(state(120, { defensePenetration: 1.01 }), outcome()));
  assert.throws(() => calculateOrdinaryOutcome(state(120, { multipliers: {} }), outcome()));
  assert.throws(() => calculateOrdinaryOutcome(state(), {}));
});

test('QA CRITICAL explicit joint outcomes consume full multipliers without guessed range law', () => {
  const results = [outcome({ probability: .75 }), outcome({ probability: .25, criticalMultiplier: 3, rangeMultiplier: 2 })];
  close(expectedOrdinaryDamage(state(), results), 225);
  assert.throws(() => expectedOrdinaryDamage(state(), []));
  assert.throws(() => expectedOrdinaryDamage(state(), [outcome({ probability: .9 })]));
  assert.throws(() => expectedOrdinaryDamage(state(), [outcome({ probability: -1 })]));
});

test('QA CONTEXT nonlinear expectation order reverses a naive-mean ranking', () => {
  const spread = [{ probability: .5, preTransformDamage: 100 }, { probability: .5, preTransformDamage: 400 }];
  const fixed = [{ probability: 1, preTransformDamage: 230 }];
  const transformed = outcomes => expectedTransformedDamage({ outcomes, exponent: .5, skillCoefficient: 4 });
  close(transformed(spread), 60);
  assert.ok(transformed(fixed) > transformed(spread));
  assert.ok(Math.sqrt(250) > Math.sqrt(230));
  close(expectedTransformedDamage({ outcomes: [{ probability: 1, preTransformDamage: 100 }], exponent: .5, skillCoefficient: 4 }), 40);
});

test('QA context profiles and unknown consequences never become equipment verdicts', () => {
  for (const contextId of ['chapter', 'Chapter Breakthrough', 'zakum', 'boss', 'guildBoss', 'arena', undefined]) {
    const result = compare(state(), state(240), { contextId });
    assert.equal(result.status, 'unsupported'); assert.equal(result.damage.winner, null);
  }
  for (const unsupportedEffects of [[], ['Main Stat conversion unknown'], ['skill level'], ['artifact trigger'], ['unknown label'], ['cadence changed']]) {
    const result = compare(state(), state(240), { unsupportedEffects });
    assert.equal(result.status, 'partial'); assert.equal(result.damage.winner, null); assert.equal(result.damage.percentChange, null);
    assert.equal(result.confidence, 'Low'); assert.equal(result.empiricalValidation, 'not-performed');
    if (unsupportedEffects.length) assert.ok(result.issues.includes('unsupported-changed-effects'));
  }
});

test('QA light factors equal and swapped states are reciprocal with no fabricated equip result', () => {
  const run = (current, candidate) => compareSupportedFactors({ factors: [{ id: 'attack', current, candidate }], unsupportedEffects: [] });
  const a = run(100, 125), b = run(125, 100), equal = run(100, 100);
  close(a.combinedFactor.ratio * b.combinedFactor.ratio, 1);
  close(a.combinedFactor.percentChange, 25); close(b.combinedFactor.percentChange, -20);
  close(equal.combinedFactor.percentChange, 0);
  for (const result of [a, b, equal]) assert.equal(result.damage.winner, null);
  for (const id of ['mainStat', 'criticalRate', 'accuracy', 'maxHp', 'defenseStat', 'evasion', 'cp', 'skillLevel']) {
    assert.equal(compareSupportedFactors({ factors: [{ id, current: 100, candidate: 200 }], unsupportedEffects: [] }).status, 'unsupported');
  }
});

test('QA missing candidate state never manufactures totals or a numerical equipment recommendation', () => {
  const result = compare(state(), undefined);
  assert.equal(result.status, 'unsupported'); assert.deepEqual(result.factors, []); assert.equal(result.damage.winner, null);
  const partial = compareSupportedFactors({ factors: [{ id: 'attack', current: 100, candidate: 120 }], unsupportedEffects: ['other sources unavailable'] });
  assert.equal(partial.status, 'partial'); assert.equal(partial.damage.winner, null);
});

test('QA zero baseline has no infinite percentage and equal complete stage amounts are only a partial factor tie', () => {
  const zero = compare(state(0), state());
  assert.equal(zero.factors[0].ratio, null); assert.equal(zero.factors[0].percentChange, null);
  assert.equal(zero.factors[0].reason, 'zero-baseline'); assert.equal(zero.damage.winner, null);
  const equal = compare(state(), state());
  close(equal.factors[0].ratio, 1); close(equal.factors[0].percentChange, 0);
  assert.equal(equal.damage.winner, null);
});

test('QA result metadata preserves independent formula/data versions and input revision', () => {
  const result = compare(state(), state(240), { inputRevision: 7 });
  assert.equal(result.inputRevision, 7);
  assert.ok(result.versions.formulaModelVersion); assert.ok(result.versions.mechanicsDataVersion);
  for (const id of [...result.claimIds, ...result.factors.flatMap(f => f.claimIds)]) assert.ok(CLAIMS[id], id);
});

test('QA cap arithmetic preserves tiny independent sources and tiny-cap exact inverse', () => {
  const tiny = replaceRemainingCapSources({ sources: [{ id: 'x', value: 1e-20 }], oldSourceIds: [], candidateSources: [], cap: 1 });
  assert.equal(tiny.before, 1e-20);
  const inverse = invertRemainingCapReplacement({ total: 0, oldSource: 0, newSource: 1e-200, cap: 1e-200, totalIsExact: true });
  assert.equal(inverse.after, 1e-200);
});

test('QA exact-total FD replacement refuses rounded totals and subprecision bonus sources', () => {
  close(replaceFinalDamageFromTotal({ totalMultiplier: 1.56, oldBonusRate: .2, newBonusRate: .4, totalIsExact: true }).after, 1.82);
  assert.throws(() => replaceFinalDamageFromTotal({ totalMultiplier: 1.56, oldBonusRate: .2, newBonusRate: .4, totalIsExact: false }));
  assert.throws(() => replaceFinalDamageFromTotal({ totalMultiplier: 1, oldBonusRate: 0, newBonusRate: 1e-20, totalIsExact: true }));
});

test('QA numerical failure: finite inputs producing overflow or ratio underflow abstain', () => {
  const overflow = state(Number.MAX_VALUE); overflow.multipliers.damage = Number.MAX_VALUE;
  assert.equal(compare(state(), overflow).status, 'unsupported');
  assert.equal(compare(state(1e308), state(1e-300)).status, 'unsupported');
  assert.equal(compareSupportedFactors({ factors: [{ id: 'attack', current: 1, candidate: Number.MAX_VALUE }], unsupportedEffects: [] }).status, 'unsupported');
});

test('QA numerical failure: attribute source reaggregation rejects positive product underflow', () => {
  assert.throws(() => replaceAttributeSources({ sources: [
    { id: 'flat', stage: 'flat', value: 1e-200 }, { id: 'ordinary', stage: 'ordinaryMultiplier', value: 1e-200 },
    { id: 'skill', stage: 'skillMultiplier', value: 1 },
  ], oldSourceIds: [], candidateSources: [] }));
});

test('QA PVP-LEVEL unambiguous within-band and cross-band transitions compound each gained level', () => {
  const ratio = (mode, fromLevel, toLevel) => pvpDefenderLevelRatio({ mode, fromLevel, toLevel });
  close(ratio('arena', 40, 43), .995 * .995 * .995);
  close(ratio('world-arena', 59, 62), .995 * .987 * .987);
  close(ratio('colosseum', 69, 72), .987 * .985 * .985);
  close(ratio('arena', 101, 104), .985 * .985 * .985);
  close(ratio('colosseum', 101, 103), .975 * .975);
  assert.notEqual(ratio('arena', 40, 43), 1 - .005 * 3);
  for (const mode of ['arena', 'world-arena', 'colosseum']) {
    for (const [a, b] of [[30, 65], [65, 75], [101, 120]]) {
      close(ratio(mode, a, b) * ratio(mode, b, a), 1);
      close(ratio(mode, a, b), ratio(mode, a, Math.floor((a + b) / 2)) * ratio(mode, Math.floor((a + b) / 2), b));
    }
    for (const level of [30, 60, 70, 99, 100, 101]) assert.equal(ratio(mode, level, level), 1);
  }
});

test('QA PVP-LEVEL same-date Korean corroboration assigns gained100 to preceding band and101 to next', () => {
  // Evidence reconciliation: research/DEPENDENCY_RESEARCH_2026-10-22.md.
  // This is a source-linked interpretation fixture, never live-game validation.
  const claim = CLAIMS['MSI-G15-PVP-LEVEL'];
  assert.ok(claim.corroboratingSources.some(source => source.url === 'https://maplestoryidle.nexon.com/ko/guide' && source.language === 'ko'));
  assert.match(claim.translationResolution, /after100/);
  assert.ok(claim.unresolved.some(text => /regional|build/.test(text)));
  for (const [mode, preceding, following] of [['arena', .987, .985], ['world-arena', .987, .985], ['colosseum', .985, .975]]) {
    close(pvpDefenderLevelRatio({ mode, fromLevel: 99, toLevel: 100 }), preceding);
    close(pvpDefenderLevelRatio({ mode, fromLevel: 100, toLevel: 101 }), following);
    const across = pvpDefenderLevelRatio({ mode, fromLevel: 98, toLevel: 102 });
    close(across, preceding * preceding * following * following);
    close(across * pvpDefenderLevelRatio({ mode, fromLevel: 102, toLevel: 98 }), 1);
    assert.equal(compare(state(), state(240), { contextId: mode }).status, 'unsupported');
  }
});

test('QA PVP-LEVEL numerical domain refuses unsupported modes, unsafe/fractional/below-anchor levels and underflow', () => {
  for (const level of [29, -1, null, '31', true, NaN, Infinity, 30.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => pvpDefenderLevelRatio({ mode: 'arena', fromLevel: level, toLevel: 40 }));
  }
  for (const mode of ['boss', 'chapter', 'Arena', null, undefined]) assert.throws(() => pvpDefenderLevelRatio({ mode, fromLevel: 30, toLevel: 31 }));
  assert.throws(() => pvpDefenderLevelRatio({ mode: 'arena', fromLevel: 101, toLevel: Number.MAX_SAFE_INTEGER }), /underflow/i);
  assert.throws(() => pvpDefenderLevelRatio({ mode: 'arena', fromLevel: Number.MAX_SAFE_INTEGER, toLevel: 101 }), /underflow/i);
});

test('QA PVP-LEVEL claim closure and isolated arithmetic cannot enable full Arena recommendations', () => {
  const claim = CLAIMS['MSI-G15-PVP-LEVEL'];
  assert.ok(claim); assert.equal(claim.source.url, 'https://maplestoryidle.nexon.com/en/guide');
  assert.match(claim.source.section, /4\.2/);
  assert.equal(claim.confidence.empirical, 'not-validated');
  assert.equal(typeof pvpDefenderLevelRatio({ mode: 'arena', fromLevel: 60, toLevel: 61 }), 'number');
  for (const contextId of ['arena', 'world-arena', 'colosseum']) {
    const result = compare(state(), state(240), { contextId });
    assert.equal(result.status, 'unsupported'); assert.equal(result.damage.winner, null); assert.deepEqual(result.factors, []);
  }
});
