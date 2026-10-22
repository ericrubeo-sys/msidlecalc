// Synthetic algebra fixtures, not observed player values or live-game validation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replaceAttributeSources, replaceFinalDamageSources, replaceFinalDamageFromTotal, replaceRemainingCapSources, invertRemainingCapReplacement } from '../public/domain/reaggregation.js';
import { CLAIMS, getClaim, MECHANICS_DATA_VERSION } from '../public/domain/mechanics-data.js';
import { readdir, readFile } from 'node:fs/promises';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} differs from ${expected}`);

test('MSI-G15-ATTRIBUTE-ORDER: R2 replacement preserves flat/multiplier/Skill stage ordering', () => {
  const sources = [
    { id: 'other', stage: 'flat', value: 100 }, { id: 'item', stage: 'flat', value: 10 },
    { id: 'ordinary-total', stage: 'ordinaryMultiplier', value: 1.5 },
    { id: 'skill-total', stage: 'skillMultiplier', value: 1.2 }, { id: 'skill-flat', stage: 'skillFlat', value: 5 },
  ];
  const result = replaceAttributeSources({ sources, oldSourceIds: ['item'], candidateSources: [{ id: 'new-item', stage: 'flat', value: 20 }] });
  assert.equal(result.before, 203);
  assert.equal(result.after, 221);
  assert.deepEqual(result.claimIds, ['MSI-G15-ATTRIBUTE-ORDER']);
  assert.equal(sources[1].value, 10);
  assert.deepEqual(result.sourceIds.after, ['other', 'ordinary-total', 'skill-total', 'skill-flat', 'new-item']);
});

test('percentage stages require one already aggregated factor, never guessing duplicate stacking', () => {
  const source = { id: 'a', stage: 'ordinaryMultiplier', value: 1.2 };
  assert.throws(() => replaceAttributeSources({ sources: [source], oldSourceIds: [], candidateSources: [] }));
  assert.throws(() => replaceAttributeSources({ sources: [source, { ...source, id: 'b' }, { id: 's', stage: 'skillMultiplier', value: 1 }], oldSourceIds: [], candidateSources: [] }));
});

test('MSI-G15-FINAL-DAMAGE: R6 independent source replacement reaggregates multiplicatively', () => {
  const result = replaceFinalDamageSources({ sources: [{ id: 'other', value: .3 }, { id: 'old', value: .2 }], oldSourceIds: ['old'], candidateSources: [{ id: 'new', value: .4 }] });
  near(result.before, 1.56);
  near(result.after, 1.82);
  assert.notEqual(result.after, 1.76);
  near(replaceFinalDamageFromTotal({ totalMultiplier: 1.56, oldBonusRate: .2, newBonusRate: .4, totalIsExact: true }).after, 1.82);
  assert.throws(() => replaceFinalDamageFromTotal({ totalMultiplier: 1.56, oldBonusRate: .2, newBonusRate: .4, totalIsExact: false }));
  assert.throws(() => replaceFinalDamageFromTotal({ totalMultiplier: 1, oldBonusRate: .2, newBonusRate: .4, totalIsExact: true }));
  assert.throws(() => replaceFinalDamageFromTotal({ totalMultiplier: 1, oldBonusRate: 0, newBonusRate: 1e-20, totalIsExact: true }));
});

test('MSI-G15-REMAINING-CAP: R3 source replacement honors remaining cap and a nonunit cap', () => {
  const result = replaceRemainingCapSources({ sources: [{ id: 'other', value: .5 }, { id: 'old', value: .2 }], oldSourceIds: ['old'], candidateSources: [{ id: 'new', value: .4 }], cap: 1 });
  near(result.before, .6);
  near(result.after, .7);
  const nonunit = replaceRemainingCapSources({ sources: [{ id: 'other', value: .5 }, { id: 'old', value: .3 }], oldSourceIds: ['old'], candidateSources: [{ id: 'new', value: .6 }], cap: 1.5 });
  near(nonunit.before, .7);
  near(nonunit.after, .9);
});

test('MSI-G15-REMAINING-CAP: exact nonsaturated inverse works while saturated/rounded inverse abstains', () => {
  const inverse = invertRemainingCapReplacement({ total: .7, oldSource: .3, newSource: .6, cap: 1.5, totalIsExact: true });
  near(inverse.unchanged, .5);
  near(inverse.after, .9);
  assert.equal(invertRemainingCapReplacement({ total: 0, oldSource: 0, newSource: 1e-200, cap: 1e-200, totalIsExact: true }).after, 1e-200);
  for (const overrides of [{ total: 1.5 }, { oldSource: 1.5 }, { totalIsExact: false }, { totalIsExact: undefined }, { total: .2 }, { total: 1.6 }, { oldSource: 1.5 * (1 - 1e-9) }]) {
    assert.throws(() => invertRemainingCapReplacement({ total: .7, oldSource: .3, newSource: .6, cap: 1.5, totalIsExact: true, ...overrides }));
  }
});

test('source identities and finite bounds prevent stale/duplicate/absent replacement and overflow', () => {
  const base = { sources: [{ id: 'old', value: .2 }], oldSourceIds: ['old'], candidateSources: [{ id: 'new', value: .3 }] };
  for (const overrides of [{ oldSourceIds: ['absent'] }, { oldSourceIds: ['old', 'old'] }, { sources: [{ id: 'old', value: .2 }, { id: 'old', value: .3 }] }, { candidateSources: [{ id: 'new', value: NaN }] }, { sources: null }, { candidateSources: [{ id: 'new', value: -1 }] }]) {
    assert.throws(() => replaceFinalDamageSources({ ...base, ...overrides }));
  }
  assert.throws(() => replaceFinalDamageSources({ ...base, sources: [{ id: 'old', value: Number.MAX_VALUE }, { id: 'other', value: Number.MAX_VALUE }] }));
  assert.throws(() => replaceRemainingCapSources({ ...base, cap: .1 }));
  assert.throws(() => replaceRemainingCapSources({ sources: [{ id: 'saturated', value: 1 }, { id: 'invalid', value: 2 }], oldSourceIds: [], candidateSources: [], cap: 1 }));
  assert.throws(() => replaceAttributeSources({ sources: [{ id: 'flat', stage: 'flat', value: 1e-200 }, { id: 'ordinary', stage: 'ordinaryMultiplier', value: 1e-200 }, { id: 'skill', stage: 'skillMultiplier', value: 1 }], oldSourceIds: [], candidateSources: [] }));
  assert.equal(replaceRemainingCapSources({ sources: [{ id: 'tiny', value: 1e-20 }], oldSourceIds: [], candidateSources: [], cap: 1 }).after, 1e-20);
});

test('empty source identities, equal and swapped replacements preserve neutral behavior', () => {
  assert.equal(replaceFinalDamageSources({ sources: [], oldSourceIds: [], candidateSources: [] }).after, 1);
  assert.equal(replaceRemainingCapSources({ sources: [], oldSourceIds: [], candidateSources: [], cap: 1 }).after, 0);
  const forward = replaceFinalDamageSources({ sources: [{ id: 'a', value: .2 }], oldSourceIds: ['a'], candidateSources: [{ id: 'b', value: .4 }] });
  const reverse = replaceFinalDamageSources({ sources: [{ id: 'b', value: .4 }], oldSourceIds: ['b'], candidateSources: [{ id: 'a', value: .2 }] });
  assert.equal(forward.before, reverse.after);
  assert.equal(forward.after, reverse.before);
});

test('versioned claims expose sources, variables, units, scope, limits and distinct validation status', () => {
  assert.match(MECHANICS_DATA_VERSION, /2026-10-15/);
  for (const [id, claim] of Object.entries(CLAIMS)) {
    assert.equal(getClaim(id), claim);
    for (const key of ['source', 'exactSupportedClaim', 'variables', 'units', 'stacking', 'order', 'rounding', 'contexts', 'exceptions', 'unresolved', 'confidence']) assert.ok(claim[key], `${id}: ${key}`);
    assert.equal(claim.source.build, null);
    assert.equal(claim.confidence.empirical, 'not-validated');
    assert.ok(Object.isFrozen(claim));
  }
  assert.throws(() => getClaim('invented'));
});

test('canonical claim closure: every claim ID referenced by public domain code resolves', async () => {
  const domain = new URL('../public/domain/', import.meta.url);
  const files = (await readdir(domain)).filter((name) => name.endsWith('.js'));
  const referenced = new Set();
  for (const file of files) {
    const source = await readFile(new URL(file, domain), 'utf8');
    for (const [id] of source.matchAll(/MSI-(?:G\d+|Q\d+)-[A-Z]+(?:-[A-Z]+)*/g)) {
      referenced.add(id);
      assert.ok(Object.hasOwn(CLAIMS, id), `${file} has dangling source reference ${id}`);
      const claim = getClaim(id);
      assert.match(claim.source.url, /^https:\/\/(?:maplestoryidle\.nexon\.com|forum\.nexon\.com)\//);
      assert.equal(claim.confidence.empirical, 'not-validated');
    }
  }
  assert.ok(referenced.has('MSI-G15-ATTRIBUTE-ORDER'));
  assert.ok(referenced.has('MSI-G15-DAMAGE-ORDER'));
});
