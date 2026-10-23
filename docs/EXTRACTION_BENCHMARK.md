# Fixed extraction scoring contract

2026-10-22. Offline development evaluation, separate from application adoption and mechanics validation. The integration owner owns the scorer and private truth annotation. Independent QA reviews association and denominators.

`scripts/lib/extraction-metrics.mjs` uses exact panel identity and row ordinal, declared before measuring. It never searches for a more favorable label match, sorts values, ignores a failed panel, or normalizes punctuation. Each known label, visible value string and visible unit token contributes one field denominator. An unreadable/absent unit in truth is explicit null, excluded from exact-field denominators and counted separately; any proposed text there is counted for inspection. This counter alone does not establish a falsely confirmed value. Extra panels/rows, omitted rows and wrong/missing known fields remain separate counts. Every extracted proposal remains unconfirmed.

All fields are literal strings or null. A visible percent sign can occur both in the value string and unit-token field; these are separate fields, not independent samples. No percentage accuracy or aggregate confidence is computed. Results separate development and heldOut splits. The known approved example is development data and cannot become held-out evidence by renaming it. Synthetic geometry tests test code behavior, not OCR recognition accuracy.

Private manifest shape:

```text
{ fixtures: [{
  id: opaque local identity,
  split: development | heldOut,
  permission: { localEvaluation: true },
  truth: [{ id: reviewed panel ID, rows: [{ label, value, unit }] }],
  observed: [{ id: same panel ID, rows: [{ label, value, unit }] }]
}] }
```

Keep image/ground truth/full observations and declared crop/cuts/configuration in ignored `.private-fixtures/`. Annotation includes every visible row inside the explicitly declared stat-body region; names/CP/UI outside that region are outside this scoped measurement, not silently omitted recognition failures. Unknown labels and repeated lines inside it still count. Crop or parser tuning on this image remains development work. For whole-image adoption, complete-image panel/name/stat detection needs its own denominator and fixtures.

Run `node scripts/score-extraction.mjs .private-fixtures/evaluation.json`. The CLI reads only a resolved JSON file within the private fixture directory, limits file size and reports fixed count keys. It does not print fixture IDs, filenames, field values, metadata, paths or error bodies. No raw fixture is copied into public output, tests, docs or source control. The scorer does not transmit or save data.

Adoption needs representative permissioned held-out screenshots and browser/lifecycle/privacy checks in addition to development counts. No claim of screenshot-to-recommendation completeness follows from this tooling.

## Development-image runtime results

The integration owner annotated all12 visible stat-body rows in the authorized example before running these spatial trials. Two explicit reviewed regions exclude names/CP and other interface areas; no full-image detector is claimed. Truth and original observations remain private. Scoring uses the fixed literal contract above, with no truth-based rematching or punctuation normalization.

| Configuration | Exact labels | Exact value strings | Exact visible unit tokens | Omitted/extra stat rows |
| --- | --- | --- | --- | --- |
| Spatialv2, independent reviewed columns, no mask |10/12 |7/12 |2/3 |0/0 |
| Spatialv2, optional neutral-text mask and widened candidate value region |11/12 |10/12 |2/3 |0/0 |

These are two configurations on the same development image, not a controlled attribution of all improvement to masking. The candidate value/delta boundary varies by row, making one global cut unsafe. Widening the reviewed value region plus the explicit neutral-text assumption helps this example, but two value strings and one label still disagree; one visible unit token is missing. Nine rows have no visible unit token, tracked separately as null truth. Percent symbols also occur inside value strings, so those field counts are not independent samples. There are zero held-out fixtures. This is not an accuracy estimate for ordinary player screenshots or a measured count of correction clicks.

A post-update same-worker masked repeat took751ms with identical raw text and full structured proposals. Vendor-resource loads were denied during that repeat; blocked-resource count stayed0. The earlier masked trial took797ms; performance is a local observation only. Main-page audit counters/storage/database/named-cache counts stayed0 in the exercised clean origin; worker globals are not instrumented. Switching mask off retained an unblurred correction and changed its status to changedObservation despite the untouched full-panel text. Reset removed the image/text from the session. No automatic field confirmation, application import or equipment recommendation occurred.

Next useful fixture collection: two additional ordinary equipment-comparison images at original resolution, one usable for development and the other kept held out until settings are frozen. Keep permission, exact reviewed regions, all visible ordered lines and unreadable fields in private manifests. More varied quality/layouts and browser checks are still needed beyond those first two; two images alone cannot establish representative adoption.
