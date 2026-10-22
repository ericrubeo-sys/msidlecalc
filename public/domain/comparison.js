// Values are raw equipment lines, not character totals. Percentage differences
// are percentage points. No guessed caps, scaling factors, or damage weights.
export const STAT_DEFINITIONS = Object.freeze([
  { id: 'attack', label: 'Attack', unit: '', step: 'any' },
  { id: 'mainStat', label: 'Main stat', unit: '', step: 'any' },
  { id: 'criticalRate', label: 'Critical Rate', unit: '%', step: 'any' },
  { id: 'criticalDamage', label: 'Critical Damage', unit: '%', step: 'any' },
  { id: 'accuracy', label: 'Accuracy', unit: '', step: 'any' },
  { id: 'skillLevel', label: '1st Job Skill Lv.', unit: '', step: '1' },
]);

export const MODEL = Object.freeze({
  version: 'unvalidated-0',
  status: 'unavailable',
  sourceRegister: 'research/SOURCES.md',
});

export function parseStat(value, definition) {
  if (value === '' || value == null) return null;
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error('Enter a number.');
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > Number.MAX_SAFE_INTEGER) {
    throw new Error('Use a non-negative number within the supported range.');
  }
  if (definition.id === 'skillLevel' && !Number.isInteger(parsed)) {
    throw new Error('Use a whole number for skill levels.');
  }
  return parsed;
}

export function compareItems(current, candidate, context) {
  const rows = STAT_DEFINITIONS.map((stat) => {
    const before = parseStat(current.stats[stat.id], stat);
    const after = parseStat(candidate.stats[stat.id], stat);
    const difference = before === null || after === null ? null : after - before;
    return { ...stat, before, after, difference };
  });
  return {
    rows,
    context: { activity: context.activity },
    comparableCount: rows.filter((row) => row.difference !== null).length,
    // Missing mechanics must never turn raw stat differences into a verdict.
    damage: { status: MODEL.status, confidence: 'Low', winner: null, percentChange: null, modelVersion: MODEL.version },
  };
}
