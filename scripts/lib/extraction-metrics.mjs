// Offline evaluation only. Exact ordinal matching is fixed before scoring;
// no nearest-label pairing, value normalization, raw-text output or game logic.
export const EXTRACTION_METRICS_VERSION = 'ordinal-exact-fields-1';
const fields = ['label', 'value', 'unit'];
const splits = ['development', 'heldOut'];
function panels(value, truth) {
  if (!Array.isArray(value)) throw new TypeError('Panel array required.');
  const ids = new Set();
  for (const panel of value) {
    if (!panel || typeof panel.id !== 'string' || !panel.id || ids.has(panel.id) || !Array.isArray(panel.rows)) throw new TypeError('Unique panel identities and row arrays required.');
    ids.add(panel.id);
    for (const row of panel.rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new TypeError('Field row required.');
      for (const field of fields) {
        const text = row[field];
        if (text !== null && typeof text !== 'string') throw new TypeError('Explicit string or null fields required.');
        if (truth && text === '') throw new TypeError('Unreadable truth must be null, not an empty string.');
      }
    }
  }
  return value;
}
const empty = () => ({ fixtures: 0, expectedPanels: 0, missingPanels: 0, extraPanels: 0, expectedRows: 0, omittedRows: 0, extraRows: 0,
  fields: Object.fromEntries(fields.map(field => [field, { exact: 0, denominator: 0, missing: 0, wrong: 0, unreadableTruth: 0, proposalForUnreadable: 0 }])) });

export function scoreExtractionFixtures(fixtures) {
  if (!Array.isArray(fixtures) || !fixtures.length) throw new TypeError('Nonempty fixture array required.');
  const output = { version: EXTRACTION_METRICS_VERSION, matching: 'panel-id-and-row-ordinal', comparison: 'literal-strings-no-normalization',
    scope: 'field-proposals-only-not-confirmation-or-game-validation', splits: Object.fromEntries(splits.map(split => [split, empty()])) };
  const identities = new Set();
  for (const fixture of fixtures) {
    if (!fixture || typeof fixture.id !== 'string' || !fixture.id || identities.has(fixture.id) || !splits.includes(fixture.split) || fixture.permission?.localEvaluation !== true) throw new TypeError('Unique fixture identity, declared split and evaluation permission required.');
    identities.add(fixture.id);
    const truth = panels(fixture.truth, true), observed = panels(fixture.observed, false);
    const result = output.splits[fixture.split]; result.fixtures++;
    result.expectedPanels += truth.length;
    const predicted = new Map(observed.map(panel => [panel.id, panel]));
    const expectedIds = new Set(truth.map(panel => panel.id));
    result.extraPanels += observed.filter(panel => !expectedIds.has(panel.id)).length;
    result.extraRows += observed.filter(panel => !expectedIds.has(panel.id)).reduce((sum, panel) => sum + panel.rows.length, 0);
    for (const panel of truth) {
      const match = predicted.get(panel.id);
      if (!match) result.missingPanels++;
      const actual = match?.rows ?? [];
      result.expectedRows += panel.rows.length;
      result.omittedRows += Math.max(0, panel.rows.length - actual.length);
      result.extraRows += Math.max(0, actual.length - panel.rows.length);
      for (let ordinal = 0; ordinal < panel.rows.length; ordinal++) {
        for (const field of fields) {
          const expected = panel.rows[ordinal][field];
          const proposal = actual[ordinal]?.[field] ?? null;
          const count = result.fields[field];
          if (expected === null) {
            count.unreadableTruth++;
            if (proposal !== null && proposal !== '') count.proposalForUnreadable++;
          } else {
            count.denominator++;
            if (proposal === expected) count.exact++;
            else if (proposal === null || proposal === '') count.missing++;
            else count.wrong++;
          }
        }
      }
    }
  }
  return output;
}
