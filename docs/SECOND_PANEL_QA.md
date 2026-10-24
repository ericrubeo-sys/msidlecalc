# Independent second-panel review — 2026-10-23

Scope: reviewed the latest user regression, lessons, data contract, item-review checkpoint, reader and field-evidence/parser implementation. The supplied application captures are private development evidence; no player pixels or stat set is copied into this document or tracked fixtures. The QA role owns only this document and `tests/second-panel-qa.test.mjs`.

The full second area was visible in the user's capture. Clipping does not explain the observed concatenated base/comparison numbers. A valid crop is not evidence of successful field recognition. Repeated digit patterns cannot justify halving a number, and a different item's labels cannot repair missing labels.

## Independent verification

The tests use invented solid glyph rasters and invented word boxes. They establish deterministic interpretation invariants, not Tesseract accuracy or actual-game numerical validity:

- Observed neutral prefix followed by colored glyphs may propose an exact unchanged prefix; original text, geometry and comparison suffix remain evidence.
- All-neutral repeated digits remain literal. Colored-only, mixed, transparent, missing-symbol, incomplete-symbol and overlapping-boundary evidence cannot establish a numeric base.
- Percent signs and grouping punctuation remain literal. Malformed comparison suffixes are retained outside the base rather than normalized into extra value digits.
- Tall border punctuation remains evidence without bridging stat rows. Unknown/repeated labels stay ordered; numeric-only fragments never acquire labels from another item.
- Invalid raster dimensions and byte coverage fail explicitly.

Initial focused run: nine of ten new groups passed. The failing independent regression demonstrated a safety bypass: raw/word coverage mismatch invoked raw-line fallback and restored a concatenated numeric proposal even when the corresponding word had unresolved field evidence. Reported to the implementation owner and fixed. The final focused run passed all 29 groups across item rows, reader and the 13 new independent QA groups.

Additional regressions verify both the reader-level field-evidence marker and word-level annotations suppress unsafe raw fallback numbers. An uncertain OCR colon in the gap may remain in comparison evidence when the neutral prefix and colored suffix are independently visible; an uncertain digit cannot be repaired that way. A reader test without the browser pixel API retains raw drafts, leaves numerical confirmation unset and releases its canvases/worker.

## Release limits

Passing these constructed cases cannot demonstrate recognition accuracy, physical iPhone behavior, or reliable automatic panel detection. Actual pinned-engine raster evaluation must report each development fixture's correct and wrong fields separately and retain previously inspected fixtures as development data. New extraction provenance must prevent stale OCR confirmation while preserving active user corrections. Existing numerical recommendations remain unavailable.
