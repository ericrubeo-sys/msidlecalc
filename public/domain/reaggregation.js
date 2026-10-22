import { finalDamageMultiplier, replaceFinalDamageSource } from './mechanics.js';
import { MECHANICS_DATA_VERSION } from './mechanics-data.js';

export const REAGGREGATION_VERSION = 'source-replacement-1';
const finite = (value, name, max = Infinity) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) throw new RangeError(`${name} must be a finite nonnegative number in range.`);
  return value;
};
function checkedSources(sources, requireStage) {
  if (!Array.isArray(sources)) throw new TypeError('An explicit source decomposition is required.');
  const ids = new Set();
  return sources.map((source) => {
    if (!source || typeof source.id !== 'string' || !source.id || ids.has(source.id)) throw new TypeError('Source ids must be nonempty and unique.');
    ids.add(source.id);
    finite(source.value, 'Source value');
    if (requireStage && !['flat', 'ordinaryMultiplier', 'skillMultiplier', 'skillFlat'].includes(source.stage)) throw new TypeError('Unknown attribute source stage.');
    return { ...source };
  });
}
function replacement({ sources, oldSourceIds, candidateSources }, requireStage = false) {
  const before = checkedSources(sources, requireStage);
  const added = checkedSources(candidateSources, requireStage);
  if (!Array.isArray(oldSourceIds) || new Set(oldSourceIds).size !== oldSourceIds.length) throw new TypeError('Explicit unique old source ids are required.');
  for (const id of oldSourceIds) if (!before.some((source) => source.id === id)) throw new RangeError('Cannot replace a source absent from the baseline decomposition.');
  const after = checkedSources([...before.filter(({ id }) => !oldSourceIds.includes(id)), ...added], requireStage);
  return { before, after };
}
const result = (before, after, decomposition, claimId) => ({
  before, after, sourceIds: { before: decomposition.before.map(({ id }) => id), after: decomposition.after.map(({ id }) => id) },
  claimIds: [claimId], versions: { model: REAGGREGATION_VERSION, data: MECHANICS_DATA_VERSION },
  scope: 'source-reaggregation-only', empiricalValidation: 'not-performed',
});
const multiply = (a, b) => {
  const product = finite(a * b, 'Product');
  if (a > 0 && b > 0 && product === 0) throw new RangeError('Positive product underflow.');
  return product;
};
function stableCapAggregate(sources, cap) {
  // log1p/expm1 avoids cancellation of very small but nonzero source rates.
  let logRemaining = 0;
  sources.forEach(({ value }) => finite(value, 'Source rate', cap));
  for (const { value } of sources) {
    if (value === cap) return cap;
    const fraction = value / cap;
    if (value > 0 && fraction === 0) throw new RangeError('Source normalization underflow.');
    logRemaining += Math.log1p(-fraction);
  }
  return multiply(cap, -Math.expm1(logRemaining)) || 0;
}

function aggregateAttribute(sources) {
  const one = (stage) => {
    const records = sources.filter((source) => source.stage === stage);
    if (records.length !== 1) throw new RangeError(`Exactly one explicitly preaggregated ${stage} factor is required.`);
    return records[0].value;
  };
  const sum = (stage) => finite(sources.filter((source) => source.stage === stage).reduce((total, source) => total + source.value, 0), stage);
  return finite(multiply(multiply(sum('flat'), one('ordinaryMultiplier')), one('skillMultiplier')) + sum('skillFlat'), 'Reaggregated attribute');
}

// Multiplier stages contain COMPLETE already-aggregated factors, never raw item
// percentages. This module does not infer stacking between different % effects.
export function replaceAttributeSources(input) {
  const decomposition = replacement(input, true);
  return result(aggregateAttribute(decomposition.before), aggregateAttribute(decomposition.after), decomposition, 'MSI-G15-ATTRIBUTE-ORDER');
}
// Values are independent source BONUS fractions, e.g. .2 for +20%, not 1.2.
export function replaceFinalDamageSources(input) {
  const decomposition = replacement(input);
  for (const { value } of [...decomposition.before, ...decomposition.after]) {
    if (value > 0 && 1 + value === 1) throw new RangeError('Final Damage source is below supported factor precision.');
  }
  return result(finalDamageMultiplier(decomposition.before.map(({ value }) => value)), finalDamageMultiplier(decomposition.after.map(({ value }) => value)), decomposition, 'MSI-G15-FINAL-DAMAGE');
}
// Alternative when an exact full multiplier already contains the identified old
// independent source. This does not require equipping the unavailable candidate.
export function replaceFinalDamageFromTotal({ totalMultiplier, oldBonusRate, newBonusRate, totalIsExact }) {
  if (totalIsExact !== true) throw new RangeError('An exact aggregate multiplier at the verified source stage is required.');
  for (const rate of [oldBonusRate, newBonusRate]) {
    finite(rate, 'Final Damage source');
    if (rate > 0 && 1 + rate === 1) throw new RangeError('Final Damage source is below supported factor precision.');
  }
  return {
    before: totalMultiplier, after: replaceFinalDamageSource(totalMultiplier, oldBonusRate, newBonusRate),
    claimIds: ['MSI-G15-FINAL-DAMAGE'],
    versions: { model: REAGGREGATION_VERSION, data: MECHANICS_DATA_VERSION },
    assumptions: ['Exact full multiplier contains the identified independent old bonus once; same source stage.'],
    scope: 'source-reaggregation-only', empiricalValidation: 'not-performed',
  };
}
// Caller must establish the named family's source semantics and published cap.
export function replaceRemainingCapSources(input) {
  const decomposition = replacement(input);
  finite(input.cap, 'Cap');
  if (input.cap === 0) throw new RangeError('Cap must be positive.');
  return result(stableCapAggregate(decomposition.before, input.cap), stableCapAggregate(decomposition.after, input.cap), decomposition, 'MSI-G15-REMAINING-CAP');
}

// Algebraic inverse of a VERIFIED independent remaining-cap source. totalIsExact
// must concern this aggregate/stage, not an assurance that rounded UI text was
// transcribed correctly. Near-cap source inversion is refused as a numerical
// precision policy (denominator <=1e-8), not a newly invented game threshold.
export function invertRemainingCapReplacement({ total, oldSource, newSource, cap, totalIsExact }) {
  finite(cap, 'Cap');
  if (cap === 0) throw new RangeError('Cap must be positive.');
  [total, oldSource, newSource].forEach((value) => finite(value, 'Rate', cap));
  if (totalIsExact !== true) throw new RangeError('Rounded or unverified aggregate totals cannot be inverted.');
  if (total === cap || oldSource === cap) throw new RangeError('Saturated inverse is ambiguous.');
  const denominator = 1 - oldSource / cap;
  if (denominator <= 1e-8) throw new RangeError('Inverse is too ill-conditioned for this arithmetic policy.');
  const unchanged = finite((total - oldSource) / denominator, 'Reconstructed unchanged aggregate', cap);
  const after = stableCapAggregate([{ value: unchanged }, { value: newSource }], cap);
  return {
    before: total, after, unchanged, claimIds: ['MSI-G15-REMAINING-CAP'],
    assumptions: ['Exact total at the verified independent source stage; no display rounding.'],
    versions: { model: REAGGREGATION_VERSION, data: MECHANICS_DATA_VERSION },
    scope: 'source-reaggregation-only', empiricalValidation: 'not-performed',
  };
}
