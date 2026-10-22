// Pure, explicitly scoped arithmetic. No UI, OCR, storage or game-data inference.
// See docs/DAMAGE_MODEL_SPEC.md; publication is not live-game validation.
import { ordinaryDefenseFactor, relativeImpact, expectedTransformedDamage } from './mechanics.js';
import { MECHANICS_DATA_VERSION } from './mechanics-data.js';

export const MODEL_VERSION = 'ordinary-stage-2026-10-22-v3';
export const MODEL_CLAIM_IDS = Object.freeze(['MSI-G15-DEFENSE', 'MSI-G15-DAMAGE-ORDER', 'MSI-G15-CRITICAL']);
export const MULTIPLIER_IDS = Object.freeze([
  'targetDamageTakenIncrease', 'targetDamageTakenDecrease', 'targetDungeonAdjustment',
  'damage', 'damageAmplification', 'monsterType', 'attackType', 'statProportional',
  'skillMastery', 'otherSkill', 'finalDamage',
]);

function finite(value, label, positive = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (positive && value === 0)) {
    throw new RangeError(`${label} must be an explicit finite ${positive ? 'positive' : 'nonnegative'} number.`);
  }
  return value;
}
function product(a, b) {
  const result = finite(a * b, 'Arithmetic result');
  if (result === 0 && a > 0 && b > 0) throw new RangeError('Arithmetic underflow.');
  return result;
}
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
}
function array(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an explicit array.`);
}

// state multipliers are FULL effective factors, not display percentages or raw
// item deltas. A verified absent/inapplicable effect is supplied explicitly as 1.
// No skill coefficient is included here: content adjustment precedes it.
export function calculateOrdinaryOutcome(state, outcome) {
  object(state, 'State'); object(outcome, 'Outcome'); object(state.multipliers, 'Multipliers');
  const unknown = Object.keys(state.multipliers).filter(id => !MULTIPLIER_IDS.includes(id));
  if (unknown.length) throw new TypeError('Unknown multiplier must remain unsupported.');
  let damage = product(finite(state.attack, 'Attack'), ordinaryDefenseFactor(state.targetDefense, state.defensePenetration));
  for (const id of MULTIPLIER_IDS.filter(id => id !== 'finalDamage')) damage = product(damage, finite(state.multipliers[id], id));
  for (const id of ['criticalMultiplier', 'rangeMultiplier', 'statusMultiplier']) damage = product(damage, finite(outcome[id], id));
  damage = product(damage, finite(state.multipliers.finalDamage, 'finalDamage'));
  return damage;
}

// Joint outcomes are explicit: this does not infer independence, a uniform
// min/max law, displayed Critical Rate semantics, or a hit-rate curve.
export function expectedOrdinaryDamage(state, outcomes) {
  array(outcomes, 'Outcomes');
  const evaluated = outcomes.map(outcome => {
    const damage = calculateOrdinaryOutcome(state, outcome);
    // Check weighting underflow in addition to the stage arithmetic guards.
    product(finite(outcome.probability, 'Outcome probability'), damage);
    return { probability: outcome.probability, preTransformDamage: damage };
  });
  return expectedTransformedDamage({
    outcomes: evaluated,
    exponent: 1, skillCoefficient: 1,
  });
}

const unsupportedDamage = () => ({ winner: null, percentChange: null, scope: null });
const base = input => ({ modelVersion: MODEL_VERSION, mechanicsDataVersion: MECHANICS_DATA_VERSION,
  inputRevision: input?.inputRevision ?? null,
  versions: { formulaModelVersion: MODEL_VERSION, mechanicsDataVersion: MECHANICS_DATA_VERSION },
  claimIds: [...MODEL_CLAIM_IDS], confidence: 'Low',
  confidenceReasons: ['Published rule implementation; no controlled live-game validation.'],
  scope: 'Ordinary attack-based damage before content adjustment and skill coefficient; not DPS or a complete equipment recommendation.',
  damage: unsupportedDamage(), empiricalValidation: 'not-performed' });

// This result deliberately never asserts an equipment winner. Even complete
// totals establish a stage, not a named encounter/rotation/clear probability.
export function compareOrdinaryStates(input) {
  const result = base(input);
  try {
    object(input, 'Comparison'); array(input.unsupportedEffects, 'Unsupported effects');
    if (input.contextId !== 'ordinary-before-content') return { ...result, status: 'unsupported', issues: ['unsupported-context'], factors: [] };
    const before = expectedOrdinaryDamage(input.current, input.currentOutcomes);
    const after = expectedOrdinaryDamage(input.candidate, input.candidateOutcomes);
    const impact = relativeImpact(before, after);
    if (impact.ratio === 0 && after > 0) throw new RangeError('Ratio underflow.');
    return { ...result, status: 'partial', issues: [
      ...(input.unsupportedEffects.length ? ['unsupported-changed-effects'] : []),
      ...(input.completeEffectsConfirmed !== true ? ['effect-completeness-unconfirmed'] : []),
      'content-and-cadence-not-modeled',
    ], factors: [{ id: 'ordinary-before-content', before, after, ...impact, claimIds: [...MODEL_CLAIM_IDS] }] };
  } catch (error) {
    if (!(error instanceof TypeError || error instanceof RangeError)) throw error;
    return { ...result, status: 'unsupported', issues: ['invalid-or-missing-numerical-input'], factors: [] };
  }
}

const FACTOR_CLAIMS = Object.freeze({
  attack: ['MSI-G15-DAMAGE-ORDER'], damage: ['MSI-G15-DAMAGE-ORDER'],
  damageAmplification: ['MSI-G15-DAMAGE-ORDER'], monsterType: ['MSI-G15-DAMAGE-ORDER'],
  attackType: ['MSI-G15-DAMAGE-ORDER'], statProportional: ['MSI-G15-DAMAGE-ORDER'],
  finalDamage: ['MSI-G15-FINAL-DAMAGE'], defense: ['MSI-G15-DEFENSE'],
});

// Useful lightweight route: compare one or more CONFIRMED effective factors.
// It explains a partial multiplicative effect only; callers cannot manufacture
// an equip verdict by omitting unknown lines. Reaggregation lives elsewhere.
export function compareSupportedFactors(input) {
  const result = base(input);
  try {
    object(input, 'Factor comparison'); array(input.factors, 'Factors'); array(input.unsupportedEffects, 'Unsupported effects');
    if (!input.factors.length) throw new RangeError('No supported factors.');
    const used = new Set();
    let ratio = 1;
    const factors = input.factors.map(factor => {
      object(factor, 'Factor');
      if (!Object.hasOwn(FACTOR_CLAIMS, factor.id) || used.has(factor.id)) throw new TypeError('Unsupported or duplicate factor.');
      used.add(factor.id);
      finite(factor.current, 'Current factor', true); finite(factor.candidate, 'Candidate factor', true);
      const impact = relativeImpact(factor.current, factor.candidate);
      if (impact.ratio === 0) throw new RangeError('Ratio underflow.');
      ratio = product(ratio, impact.ratio);
      return { id: factor.id, before: factor.current, after: factor.candidate, ...impact, claimIds: [...FACTOR_CLAIMS[factor.id]] };
    });
    const impact = relativeImpact(1, ratio);
    return { ...result, status: 'partial', scope: 'Isolated ordinary pre-content factor effect; remaining terms held equal. Not an equipment verdict.',
      issues: [...(input.unsupportedEffects.length ? ['unsupported-changed-effects'] : []), 'remaining-factors-and-context-not-established'],
      factors, combinedFactor: { ...impact, claimIds: [...new Set(factors.flatMap(f => f.claimIds))] } };
  } catch (error) {
    if (!(error instanceof TypeError || error instanceof RangeError)) throw error;
    return { ...result, status: 'unsupported', issues: ['invalid-or-missing-numerical-input'], factors: [], combinedFactor: null };
  }
}

// MSI-G15-PVP-LEVEL / English guide Battle §4.2. Isolated relative DAMAGE
// TAKEN multiplier from defender level only. Does not include the separate
// defender prebattle-stat adjustment, attack damage or skill coefficient.
// No absolute <=30 anchor, attacker-level difference or full PvP verdict is
// inferred. Source ranges ending100 overlap its '100+' wording, so any path
// crossing99->100 rejects rather than selecting a preferred interpretation.
export function pvpDefenderLevelRatio({ mode, fromLevel, toLevel }) {
  const bands = {
    arena: [[31, 60, .995], [61, 100, .987], [101, Infinity, .985]],
    'world-arena': [[31, 60, .995], [61, 100, .987], [101, Infinity, .985]],
    colosseum: [[31, 60, .995], [61, 70, .987], [71, 100, .985], [101, Infinity, .975]],
  };
  if (!Object.hasOwn(bands, mode)) throw new TypeError('Unsupported level-adjustment mode.');
  for (const value of [fromLevel, toLevel]) {
    if (!Number.isSafeInteger(value) || value < 30) throw new RangeError('Defender levels must be safe integers at least 30.');
  }
  const lower = Math.min(fromLevel, toLevel);
  const upper = Math.max(fromLevel, toLevel);
  if (lower < 100 && upper >= 100) throw new RangeError('Ambiguous published level-100 transition.');
  let ratio = 1;
  for (const [start, end, step] of bands[mode]) {
    const count = Math.max(0, Math.min(upper, end) - Math.max(lower, start - 1));
    const factor = step ** count;
    if (factor === 0) throw new RangeError('Level-adjustment underflow.');
    ratio = product(ratio, factor);
  }
  if (toLevel < fromLevel) ratio = finite(1 / ratio, 'Level-adjustment ratio', true);
  return ratio;
}
