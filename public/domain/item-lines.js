// Lossless manual-line intake and raw occurrence comparison. No game formula,
// aggregation, weighting, storage, clock, network, or equipment recommendation.
export const ITEM_LINES_VERSION = 'manual-lines-2';
export const STAT_REGISTRY_VERSION = 'labels-1';
export const STAT_REGISTRY = Object.freeze([
  ['attack', 'Attack', 'statPoint'],
  ['mainStat', 'Main Stat', 'statPoint'],
  ['criticalRate', 'Critical Rate', 'displayPercent'],
  ['criticalDamage', 'Critical Damage', 'displayPercent'],
  ['accuracy', 'Accuracy', 'statPoint'],
  ['skillLevel', '1st Job Skill Lv.', 'level'],
  ['statPropDamage', 'Stat Prop. Damage', 'displayPercent'],
  ['finalDamage', 'Final Damage', 'displayPercent'],
  ['maxHp', 'Max HP', 'statPoint'],
  ['maxMp', 'Max MP', 'statPoint'],
  ['cp', 'CP', 'statPoint'],
].map(([id, label, unit]) => Object.freeze({ id, label, unit })));

const UNITS = new Set(['statPoint', 'displayPercent', 'internalRate', 'factor', 'level', 'unknown']);
const normalizeLabel = (label) => label.trim().replace(/\s+/g, ' ').toLowerCase();
const copy = (value) => value == null ? value : structuredClone(value);
const canonical = (text) => {
  const negative = text.startsWith('-');
  const unsigned = text.replace(/^[+-]/, '');
  const [whole = '', fraction = ''] = unsigned.split('.');
  const integer = whole.replace(/^0+(?=\d)/, '') || '0';
  const decimals = fraction.replace(/0+$/, '');
  const result = `${integer}${decimals ? `.${decimals}` : ''}`;
  return `${negative && result !== '0' ? '-' : ''}${result}`;
};
const decimalParts = (decimal) => {
  const scale = decimal.split('.')[1]?.length ?? 0;
  return { integer: BigInt(decimal.replace('.', '')), scale };
};
const formatInteger = (integer, scale) => {
  const negative = integer < 0n;
  const digits = (negative ? -integer : integer).toString().padStart(scale + 1, '0');
  return canonical(`${negative ? '-' : ''}${scale ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}` : digits}`);
};

// Locale: ASCII decimal dot, optional sign, no grouping/exponents/suffixes.
// A terminal % is accepted ONLY with displayPercent. Maximum absolute value
// MAX_SAFE_INTEGER and at most 18 fractional places are technical limits, not
// game caps. Canonical strings retain exact decimal precision; value is merely
// a display convenience. Arithmetic below operates on the decimal strings.
export function parseDecimal(rawValue, { unit = 'statPoint', allowNegative = true } = {}) {
  const invalid = (issue) => ({ state: 'invalid', decimal: null, value: null, issues: [issue] });
  if (!UNITS.has(unit)) return invalid('unsupportedUnit');
  if (rawValue == null || (typeof rawValue === 'string' && !rawValue.trim())) {
    return { state: 'missing', decimal: null, value: null, issues: ['missingValue'] };
  }
  if (typeof rawValue !== 'string' && typeof rawValue !== 'number') return invalid('invalidType');
  let text = String(rawValue).trim();
  if (text.endsWith('%')) {
    if (unit !== 'displayPercent') return invalid('unitMismatch');
    text = text.slice(0, -1).trim();
  }
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)) return invalid('invalidDecimal');
  const decimal = canonical(text);
  const { integer, scale } = decimalParts(decimal);
  if (scale > 18) return invalid('unsupportedPrecision');
  if ((integer < 0n ? -integer : integer) > BigInt(Number.MAX_SAFE_INTEGER) * 10n ** BigInt(scale)) return invalid('unsupportedMagnitude');
  if (!allowNegative && integer < 0n) return invalid('negativeUnsupported');
  if (unit === 'level' && scale !== 0) return invalid('integerRequired');
  const value = Number(decimal);
  if (!Number.isFinite(value)) return invalid('nonfinite');
  return { state: 'parsed', decimal, value, issues: [] };
}

function parseFields(fields, confirmed) {
  const rawLabel = fields.rawLabel ?? '';
  if (typeof rawLabel !== 'string') throw new TypeError('rawLabel must be a string.');
  const definition = STAT_REGISTRY.find((entry) => normalizeLabel(entry.label) === normalizeLabel(rawLabel));
  const unit = fields.unit ?? (typeof fields.rawValue === 'string' && fields.rawValue.trim().endsWith('%') ? 'displayPercent' : definition?.unit ?? 'unknown');
  const parsed = parseDecimal(fields.rawValue, { unit });
  const state = parsed.state === 'parsed' ? (confirmed ? 'confirmed' : 'needsReview') : parsed.state;
  return {
    rawLabel, unit, statId: definition?.id ?? null,
    recognition: definition ? 'recognized' : 'unknown',
    // A displayed percentage does not prove additive stacking (Final Damage
    // is a counterexample). This parser assigns no percentage source stage.
    valueKind: ({ statPoint: 'flat', displayPercent: 'unknown', internalRate: 'unknown', factor: 'multiplier', level: 'level' })[unit] ?? 'unknown',
    state, issues: parsed.issues,
    candidateValue: parsed.decimal === null ? null : { decimal: parsed.decimal, unit },
    effectiveValue: state === 'confirmed' ? { decimal: parsed.decimal, unit } : null,
    value: state === 'confirmed' ? parsed.value : null,
  };
}

// correction is an explicit partial overlay with optional confirmed/revision.
// The original observation/raw fields are retained even when correction clears
// a quantity. Reprocessing/merging OCR runs is outside this manual-only module.
export function createItemLine(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('A line object is required.');
  const { id, ordinal = 0, rawLabel = '', rawValue = '', provenance = { kind: 'manual' }, sourceFamily = 'unknown', confirmed = true, correction = null } = input;
  if (typeof id !== 'string' || !id || !Number.isSafeInteger(ordinal) || ordinal < 0) throw new TypeError('A stable id and nonnegative ordinal are required.');
  const rawText = input.rawText ?? `${rawLabel}${rawLabel ? ': ' : ''}${rawValue ?? ''}`;
  if (typeof rawText !== 'string') throw new TypeError('rawText must be a string.');
  const observation = parseFields({ rawLabel, rawValue, unit: input.unit }, confirmed === true);
  const effective = correction === null ? observation : parseFields({ rawLabel, rawValue, unit: observation.unit, ...correction }, correction.confirmed !== false);
  return {
    id, lineId: id, ordinal, rawLabel, rawValue: copy(rawValue), rawText,
    provenance: copy(provenance), sourceFamily,
    statId: effective.statId, recognition: effective.recognition, unit: effective.unit,
    valueKind: effective.valueKind, state: effective.state, issues: [...effective.issues],
    observation: { ...observation, rawText, rawLabel, rawValue: copy(rawValue), provenance: copy(provenance) },
    correction: copy(correction), effectiveLabel: effective.rawLabel,
    effectiveValue: effective.effectiveValue, value: effective.value,
    mechanicsClaimIds: [],
  };
}

export function parseItemLines(inputs, { idPrefix = 'line' } = {}) {
  if (!Array.isArray(inputs)) throw new TypeError('Lines must be an array.');
  const lines = inputs.map((input, ordinal) => createItemLine({ ...input, id: input.id ?? `${idPrefix}-${ordinal}`, ordinal }));
  if (new Set(lines.map((line) => line.id)).size !== lines.length) throw new TypeError('Line ids must be unique within an item.');
  return lines;
}

const matchKey = (line) => JSON.stringify([
  line.statId ?? normalizeLabel(line.effectiveLabel), line.unit, line.valueKind, line.sourceFamily,
]);
const subtract = (before, after) => {
  const a = decimalParts(before);
  const b = decimalParts(after);
  const scale = Math.max(a.scale, b.scale);
  return formatInteger(b.integer * 10n ** BigInt(scale - b.scale) - a.integer * 10n ** BigInt(scale - a.scale), scale);
};

// Matching means nth compatible visible occurrence, NOT proven aggregation or
// source equivalence. Missing lines mean unknown unless a complete reviewed
// opposite visible list establishes absence. Unknown labels are retained
// and can expose raw same-label differences without establishing their meaning.
export function compareItemLines(currentLines, candidateLines, { currentComplete = false, candidateComplete = false } = {}) {
  if (typeof currentComplete !== 'boolean' || typeof candidateComplete !== 'boolean') throw new TypeError('Explicit visible-list completeness flags required.');
  const available = new Map();
  for (const line of candidateLines) {
    const key = matchKey(line);
    if (!available.has(key)) available.set(key, []);
    available.get(key).push(line);
  }
  const used = new Set();
  const pairs = currentLines.map((current) => {
    const candidate = available.get(matchKey(current))?.shift() ?? null;
    if (candidate) used.add(candidate);
    return [current, candidate];
  });
  for (const candidate of candidateLines) if (!used.has(candidate)) pairs.push([null, candidate]);
  const identity = line => line.statId ?? normalizeLabel(line.effectiveLabel);
  const reliableList = lines => lines.every(line => line.effectiveLabel.trim() && line.state === 'confirmed' && line.effectiveValue);
  const absenceAllowed = (line, opposite, complete) => complete && reliableList(opposite) && line?.effectiveLabel.trim() && line.state === 'confirmed' && line.effectiveValue && !opposite.some(other => identity(other) === identity(line) && matchKey(other) !== matchKey(line));
  const rows = pairs.map(([current, candidate]) => {
    const removed = current && !candidate && absenceAllowed(current,candidateLines,candidateComplete);
    const added = candidate && !current && absenceAllowed(candidate,currentLines,currentComplete);
    const before = added ? 0 : current?.value ?? null;
    const after = removed ? 0 : candidate?.value ?? null;
    const differenceDecimal = removed ? subtract(current.effectiveValue.decimal,'0') : added ? subtract('0',candidate.effectiveValue.decimal) : current?.effectiveValue && candidate?.effectiveValue
      ? subtract(current.effectiveValue.decimal, candidate.effectiveValue.decimal) : null;
    return {
      current, candidate, before, after,
      difference: differenceDecimal === null ? null : Number(differenceDecimal), differenceDecimal,
      unit: (current ?? candidate).unit,
      status: removed || added ? 'rawComparable' : !current || !candidate ? 'unmatched' : differenceDecimal === null ? 'unknown' : 'rawComparable',
      presenceChange: removed ? 'removed' : added ? 'added' : null,
      absenceEvidence: removed || added ? 'reviewed-complete-visible-list' : null,
      matchingBasis: 'compatible-occurrence-only',
    };
  });
  return {
    version: ITEM_LINES_VERSION, rows,
    comparableCount: rows.filter((row) => row.status === 'rawComparable').length,
    damage: { status: 'unavailable', confidence: 'Low', winner: null, percentChange: null },
  };
}
