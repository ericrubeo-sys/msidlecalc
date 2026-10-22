// Published-rule primitives, not a complete damage/DPS calculator.
// Callers must establish the stat family, exact attack/context and source units.
export const EVIDENCE = Object.freeze({
  version: 'published-rules-2026-10-15-v1',
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
  if (unit === 'displayPercent') return value / 100;
  if (unit === 'internalPermille') return value / 1000;
  if (unit === 'fraction') return value;
  throw new TypeError('Rate unit must be displayPercent, internalPermille, or fraction.');
}

// Additive-bonus rates are fractions. Do not pass complete multipliers here.
export function orderedAttribute({ flatSources, bonusRates, skillBonusRates, skillFlatSources }) {
  for (const [name, values] of Object.entries({ flatSources, bonusRates, skillBonusRates, skillFlatSources })) {
    list(values, name);
    values.forEach((value) => finite(value, name));
  }
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  return finite(sum(flatSources) * (1 + sum(bonusRates)) * (1 + sum(skillBonusRates)) + sum(skillFlatSources), 'Aggregated attribute');
}

// Source and cap use absolute fractional-rate units, not proportions of the cap:
// e.g. a 30% source is .30 even for a family with a 150% (1.50) cap.
// Requires verified independent remaining-cap sources; never invert a rounded
// total at its cap to invent the unchanged contribution.
export function remainingCapAggregate(sourceRates, cap) {
  list(sourceRates, 'Source rates');
  finite(cap, 'Cap', { min: Number.MIN_VALUE });
  let remaining = 1;
  for (const rate of sourceRates) {
    finite(rate, 'Source rate', { max: cap });
    remaining *= 1 - rate / cap;
  }
  return finite(cap * (1 - remaining), 'Remaining-cap aggregate');
}

// Explicit source list ensures item replacement is reaggregation, not T+delta.
export function replaceRemainingCapSource(unchangedSources, newSource, cap) {
  list(unchangedSources, 'Unchanged sources');
  return remainingCapAggregate([...unchangedSources, newSource], cap);
}

// Final Damage source bonuses multiply as (1+rate). A 20% bonus is 0.20 here.
export function finalDamageMultiplier(sourceBonusRates) {
  list(sourceBonusRates, 'Final Damage source rates');
  return finite(sourceBonusRates.reduce((product, rate) => product * (1 + finite(rate, 'Final Damage bonus')), 1), 'Final Damage multiplier');
}

// These are exact confirmed multipliers at the same source stage. Rounded UI
// values need an uncertainty policy before an application can call this safely.
export function replaceFinalDamageSource(totalMultiplier, oldBonusRate, newBonusRate) {
  finite(totalMultiplier, 'Total Final Damage multiplier', { min: 1 });
  finite(oldBonusRate, 'Old Final Damage bonus');
  finite(newBonusRate, 'New Final Damage bonus');
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
    expectation += outcome.probability * outcome.preTransformDamage ** exponent * skillCoefficient;
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
  const percentChange = finite((ratio - 1) * 100, 'Relative percentage change', { min: -100 });
  return { ratio, percentChange, reason: null };
}
