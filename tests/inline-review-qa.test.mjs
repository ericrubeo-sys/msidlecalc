// Independent invented records. These test input/session contracts, not game accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReviewRecord, parseReviewRecords, adoptReviewRecords } from '../public/domain/inline-review.js';

const ocr = (id, rawLabel, rawValue, unit = 'unknown', imageRevision = 3) => ({
  id, rawLabel, rawValue, unit, rawText: `${rawLabel} ${rawValue}`,
  confirmed: false, correction: null, reviewedImageRevision: null,
  provenance: { kind: 'ocr', imageRevision, runId: 1, region: {x: 2, y: 3, width: 90, height: 110} },
});
const items = value => ({ current: [ocr('a', 'Attack', value)], candidate: [ocr('b', 'Attack', '80')] });

test('QA inline normalization preserves raw evidence and never confirms grouped OCR by itself', () => {
  const source = ocr('a', 'Attack', '1,234.5'); const snapshot = structuredClone(source);
  const normalized = normalizeReviewRecord(source);
  assert.deepEqual(source, snapshot);
  assert.equal(normalized.rawValue, '1,234.5');
  const parsed = parseReviewRecords([source], { imageRevision: 3 });
  assert.equal(parsed[0].correction.rawValue, '1234.5');
  assert.equal(parsed[0].state, 'needsReview');
  assert.equal(parsed[0].effectiveValue, null);
  assert.notEqual(parsed[0].state, 'confirmed');
  assert.deepEqual(parsed[0].provenance, source.provenance);
});

test('QA explicit batch review supports strict English grouping, percent suffix and skill levels', () => {
  const source = [ocr('a', 'Attack', '1,234'), ocr('b', 'Critical Rate', '12.5%'), ocr('c', '3rd Job Skill Lv.', '13', 'level')];
  const result = parseReviewRecords(source, { imageRevision: 3, confirmed: true });
  assert.deepEqual(result.map(line => line.effectiveValue?.decimal), ['1234', '12.5', '13']);
  assert.deepEqual(result.map(line => line.unit), ['statPoint', 'displayPercent', 'level']);
  assert.ok(source.every(line => line.confirmed === false && line.correction === null));
});

test('QA blank stays unknown, explicit zero remains zero, malformed grouping is never guessed', () => {
  const blank = parseReviewRecords([ocr('a', 'Attack', '')], { imageRevision: 3, confirmed: true })[0];
  assert.equal(blank.effectiveValue, null); assert.equal(blank.state, 'missing');
  const zero = parseReviewRecords([ocr('a', 'Attack', '0')], { imageRevision: 3, confirmed: true })[0];
  assert.equal(zero.effectiveValue.decimal, '0');
  for (const value of ['1,23', '12,5', '1,234,56', '1.234,5', '1e3', '0x10', '1,234x', 'O', 'NaN']) {
    const parsed = parseReviewRecords([ocr('a', 'Attack', value)], { imageRevision: 3, confirmed: true })[0];
    assert.equal(parsed.effectiveValue, null, value);
    assert.equal(parsed.state, 'invalid', value);
  }
});

test('QA correction overlays win without rewriting original text or merging repeated occurrences', () => {
  const source = [ocr('a', 'Attack', '1,000'), ocr('b', 'Attack', '20'), ocr('c', 'Unknown effect', '', 'unknown')];
  source[0].correction = { rawValue: '1,200', confirmed: false };
  const snapshot = structuredClone(source);
  const result = parseReviewRecords(source, { imageRevision: 3, confirmed: true });
  assert.deepEqual(source, snapshot);
  assert.deepEqual(result.map(line => line.id), ['a', 'b', 'c']);
  assert.deepEqual(result.map(line => line.effectiveValue?.decimal ?? null), ['1200', '20', null]);
  assert.equal(result[0].rawValue, '1,000');
  assert.equal(result[0].rawText, 'Attack 1,000');
  assert.equal(result[2].statId, null);
});

test('QA same-image reread preserves edited lists, invalidates checks and does not merge by ordinal', () => {
  const existing = items('60');
  existing.current[0].correction = { rawValue: '65', confirmed: true };
  existing.current[0].confirmed = true; existing.current[0].reviewedImageRevision = 3;
  existing.current.push(ocr('extra', 'Unknown effect', '?'));
  const incoming = items('90'); incoming.current[0].id = 'new-run';
  const before = structuredClone({existing, incoming});
  const result = adoptReviewRecords(existing, incoming, { imageRevision: 3, previousImageRevision: 3, edited: true });
  assert.equal(result.preserved, true);
  assert.deepEqual(result.items.current.map(line => line.id), ['a', 'extra']);
  assert.equal(result.items.current[0].correction.rawValue, '65');
  assert.equal(result.items.current[0].confirmed, false);
  assert.equal(result.items.current[0].correction.confirmed, false);
  assert.deepEqual({existing, incoming}, before);
  result.items.current[0].correction.rawValue = '999';
  assert.equal(existing.current[0].correction.rawValue, '65');
});

test('QA an untouched reread adopts observations, and image replacement does not leak prior corrections', () => {
  const existing = items('60'); existing.current[0].correction = { rawValue: '65', confirmed: false };
  const incoming = items('90'); incoming.current[0].id = 'new-image';
  for (const settings of [{imageRevision: 3, previousImageRevision: 3, edited: false}, {imageRevision: 4, previousImageRevision: 3, edited: true}]) {
    const result = adoptReviewRecords(existing, incoming, settings);
    assert.equal(result.preserved, false);
    assert.equal(result.items.current[0].id, 'new-image');
    assert.equal(result.items.current[0].rawValue, '90');
    assert.equal(result.items.current[0].correction, null);
    result.items.current[0].provenance.region.x = 999;
    assert.equal(incoming.current[0].provenance.region.x, 2);
  }
});

test('QA unsupported units and fractional skill levels remain invalid despite explicit review', () => {
  for (const record of [ocr('a', 'Attack', '12', 'made-up-unit'), ocr('b', '3rd Job Skill Lv.', '1.5', 'level')]) {
    const result = parseReviewRecords([record], { imageRevision: 3, confirmed: true })[0];
    assert.equal(result.effectiveValue, null); assert.equal(result.state, 'invalid');
  }
});
