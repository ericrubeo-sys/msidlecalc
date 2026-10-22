// Published-rule primitives, not a complete damage/DPS calculator.
// Callers must establish the stat family, exact attack/context and source units.
export const EVIDENCE = Object.freeze({
  version: 'published-rules-2026-10-15-v2',
  source: 'https://maplestoryidle.nexon.com/en/guide',
  inspectedOn: '2026-10-22',
  sourceUpdatedOn: '2026-10-15',
  gameBuild: null,
  implementationScope: 'isolated-primitives',
  empiricalValidation: 'not-performed',
});

function finite(value, name, { min = 0, max = Infinity } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a finite number from ${min} to ${max}.`);
  }
  return value;
}

function list(values, name) {
  if (!Array.isArray(values)) throw new TypeError(`${name} must be an explicit array of sources.`);
}

// Input percentages must explicitly name their scale; no implicit 1000/100 mix.
export function normalizeRate(value, unit) {
  finite(value, 'Rate');
  if (unit === 'fraction') return value;
  if (!['displayPercent', 'internalPermille'].includes(unit)) throw new TypeError('Rate unit must be displayPercent, internalPermille, or fraction.');
  const normalized = value / (unit === 'displayPercent' ? 100 : 1000);
  if (value > 0 && normalized === 0) throw new RangeError('Rate normalization underflow.');
  return normalized;
}

// Only verified same-type ADDITIVE groups belong in these rate arrays. This is
// not a rule that unrelated percentage sources add. Use source-stage-aware
// reaggregation for equipment replacement. Rates are fractions, not factors.
export function orderedAttribute({ flatSources, bonusRates, skillBonusRates, skillFlatSources }) {
  for (const [name, values] of Object.entries({ flatSources, bonusRates, skillBonusRates, skillFlatSources })) {
    list(values, name);
    values.forEach((value) => finite(value, name));
  }
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  const factor = rates => {
    const bonus = finite(sum(rates), 'Additive bonus sum');
    if (bonus > 0 && 1 + bonus === 1) throw new RangeError('Additive bonus below supported factor precision.');
    return 1 + bonus;
  };
  return finite(sum(flatSources) * factor(bonusRates) * factor(skillBonusRates) + sum(skillFlatSources), 'Aggregated attribute');
}

// Source and cap use absolute fractional-rate units, not proportions of the cap:
// e.g. a 30% source is .30 even for a family with a 150% (1.50) cap.
// Requires verified independent remaining-cap sources; never invert a rounded
// total at its cap to invent the unchanged contribution.
export function remainingCapAggregate(sourceRates, cap) {
  list(sourceRates, 'Source rates');
  finite(cap, 'Cap', { min: Number.MIN_VALUE });
  sourceRates.forEach(rate => finite(rate, 'Source rate', { max: cap }));
  if (sourceRates.includes(cap)) return cap;
  let logRemaining = 0;
  for (const rate of sourceRates) {
    const fraction = rate / cap;
    if (rate > 0 && fraction === 0) throw new RangeError('Source normalization underflow.');
    logRemaining += Math.log1p(-fraction);
  }
  const result = finite(cap * -Math.expm1(logRemaining), 'Remaining-cap aggregate');
  if (sourceRates.some(rate => rate > 0) && result === 0) throw new RangeError('Remaining-cap underflow.');
  return result === 0 ? 0 : result;
}

// Explicit source list ensures item replacement is reaggregation, not T+delta.
export function replaceRemainingCapSource(unchangedSources, newSource, cap) {
  list(unchangedSources, 'Unchanged sources');
  return remainingCapAggregate([...unchangedSources, newSource], cap);
}

// Final Damage source bonuses multiply as (1+rate). A 20% bonus is 0.20 here.
export function finalDamageMultiplier(sourceBonusRates) {
  list(sourceBonusRates, 'Final Damage source rates');
  return finite(sourceBonusRates.reduce((product, rate) => {
    finite(rate, 'Final Damage bonus');
    if (rate > 0 && 1 + rate === 1) throw new RangeError('Final Damage bonus below supported factor precision.');
    return finite(product * (1 + rate), 'Final Damage product');
  }, 1), 'Final Damage multiplier');
}

// These are exact confirmed multipliers at the same source stage. Rounded UI
// values need an uncertainty policy before an application can call this safely.
export function replaceFinalDamageSource(totalMultiplier, oldBonusRate, newBonusRate) {
  finite(totalMultiplier, 'Total Final Damage multiplier', { min: 1 });
  finite(oldBonusRate, 'Old Final Damage bonus');
  finite(newBonusRate, 'New Final Damage bonus');
  for (const rate of [oldBonusRate, newBonusRate]) {
    if (rate > 0 && 1 + rate === 1) throw new RangeError('Final Damage bonus below supported factor precision.');
  }
  const unchanged = totalMultiplier / (1 + oldBonusRate);
  if (unchanged < 1) throw new RangeError('Old source exceeds the confirmed Final Damage total.');
  return finite(unchanged * (1 + newBonusRate), 'Replaced Final Damage multiplier');
}

export function ordinaryDefenseFactor(targetDefense, penetrationRate) {
  finite(targetDefense, 'Target Defense');
  finite(penetrationRate, 'Effective Defense Penetration', { max: 1 });
  return 5000 / (targetDefense * (1 - penetrationRate) + 6000);
}

// This accepts an EXPLICIT outcome distribution, not an assumed min/max law.
// Exact mode constants/profiles remain unimplemented. A caller selects an
// exponent only after establishing its sourced, eligible context and stage.
export function expectedTransformedDamage({ outcomes, exponent, skillCoefficient }) {
  list(outcomes, 'Outcomes');
  if (![1, 0.5, 1 / 3].includes(exponent)) throw new RangeError('Unsupported explicit transform exponent.');
  finite(skillCoefficient, 'Skill coefficient');
  if (outcomes.length === 0) throw new RangeError('An explicit outcome distribution is required.');
  let mass = 0;
  let expectation = 0;
  for (const outcome of outcomes) {
    finite(outcome.probability, 'Outcome probability', { max: 1 });
    finite(outcome.preTransformDamage, 'Pre-transform damage');
    mass += outcome.probability;
    const term = finite(outcome.probability * outcome.preTransformDamage ** exponent * skillCoefficient, 'Weighted outcome');
    if (outcome.probability > 0 && outcome.preTransformDamage > 0 && skillCoefficient > 0 && term === 0) throw new RangeError('Weighted outcome underflow.');
    expectation = finite(expectation + term, 'Expected transformed damage');
  }
  if (Math.abs(mass - 1) > 1e-10) throw new RangeError('Outcome probabilities must sum to 1.');
  return finite(expectation, 'Expected transformed damage');
}

// Raw ratios are not automatically a supported equipment verdict or DPS claim.
export function relativeImpact(current, candidate) {
  finite(current, 'Current modeled amount');
  finite(candidate, 'Candidate modeled amount');
  if (current === 0) return { ratio: null, percentChange: null, reason: 'zero-baseline' };
  const ratio = finite(candidate / current, 'Relative ratio');
  if (candidate > 0 && ratio === 0) throw new RangeError('Relative ratio underflow.');
  const percentChange = finite((ratio - 1) * 100, 'Relative percentage change', { min: -100 });
  return { ratio, percentChange, reason: null };
}
