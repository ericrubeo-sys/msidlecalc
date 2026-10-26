# OCR row coverage and bounded recovery

2026-10-25. Feature preview only. Original-image observations below were collected by the integration owner through the actual local browser reader. Independent software QA is recorded separately in RING_MILESTONE_QA_2026-10-25.md. No private screenshot, OCR transcript or player data is committed.

## Implemented behavior

`ocr-row-coverage.js` compares neutral label/value ink bands with spatial OCR rows **between at least two trusted typed stat anchors**. A bracketed unmatched band or recognizable unreadable value can request a selective row read. It does not assume six rows, infer semantic completeness from known labels, certify crop edges, or count colored deltas as item sources.

`ocr-reader.js` allows at most two retry targets per panel and four actual retry recognitions per run, including fallback panel attempts. A retry uses one line segmentation on the original crop at 3× scale. It retains original OCR and separate retry observations. `ocr-row-recovery.js` requires exactly one lexical observed row, one valid typed proposal, agreement with any existing label, and neutral/separated evidence on the **base number itself**. Ambiguous observations stay unresolved; no merged-digit repair is guessed.

Fresh unreadable drafts can receive an unconfirmed proposal. A newly detected gap receives a visible row, blank if recovery failed. Existing valid values, corrections, manually entered records and confirmed records are protected. Recovered geometry is mapped into original-panel coordinates for source-order inference. On a same-image edited reread, new gap evidence adds an empty review request rather than overwriting the retained list with a guessed value. Repeated evidence is deduplicated by image, panel and region. A new image starts a new observation set. All adoption invalidates confirmations.

Blank OCR separators remain in private observations but are excluded from the visible correction list. Recognizable unreadable effects remain visible. Both item cards still lead directly to typed correction and confirmation; crop adjustment remains optional. Warnings are advisory and do not introduce diagnostic disclosures.

## Actual-image development evaluation

The original full-resolution ring and shoulder images were used with the actual `readComparison` browser pipeline, pinned local Tesseract7/English best model, automatic panel layout, normal typed import and row recovery. Truth was checked visually. Each image contains two six-line panels, but this count was used only for scoring truth, never detection. The shoulder's two separate Attack sources remain two rows. The private manifests declare fixed ordered alignment before running the scorer; no best-label matching or numeric normalization is used.

Before and after refer to proposals **within the same reader run**, before and after adoption of selective retries. They are not separately timed implementations, a comparison against production, or independent samples.

| Metric | Before recovery | After recovery |
| --- | ---: | ---: |
| Development images / panels / truth rows | 2 / 4 / 24 | 2 / 4 / 24 |
| Missing / extra panels | 0 / 0 | 0 / 0 |
| Omitted / extra / duplicate stat rows | 0 / 0 / 0 | 0 / 0 / 0 |
| Exact identities | 24/24 | 24/24 |
| Exact units | 24/24 | 24/24 |
| Exact values | 22/24 (91.7%) | 23/24 (95.8%) |
| Missing values / wrong proposed values | 2 / 0 | 1 / 0 |
| Automatic complete claims / false complete claims | 0 / 0 | 0 / 0 |

One of two retry targets recovered: the ring candidate's `3rd Job Skill Lv.` became16 with the colored−1 excluded. All12 ring values then matched truth. The shoulder's Boss Monster Damage7.5% remains blank: the retry also observed a border-like lexical `I`, so the strict single-row evidence gate rejected automatic adoption. All other11 shoulder values matched. This is a visible required correction, not zero or a successful complete read. A future improvement may isolate borders using independent layout evidence; deleting inconvenient OCR fragments is not justified.

Measured complete-reader latency for the final development runs was3,395.8ms (ring) and3,346.9ms (shoulder), including selective recovery, on this desktop browser. Prior ring repeats were3,625.1ms and3,597.6ms; the latter recovered the same value. Cache state was not controlled, so final aggregate timing uses `mode:unknown`. No phone timing, baseline speedup or worst-case latency claim is made.

**Genuine held-out images:0.** Existing private files and their derivatives had already been observed or used for tuning. They were not relabeled as held-out. These results establish behavior on two reused development cases only. No actual complete-row omission was present in these two cases; omitted-band recovery is exercised with synthetic geometry, not claimed as demonstrated on an unseen game image. Zero false-complete claims reflects the deliberate absence of automatic completeness certification, not measured completeness recall.

## Evaluation tooling and reproduction

The existing loopback evaluator now provides `/comparison` alongside its previous crop/column harness. Run `node scripts/serve-ocr-evaluation.mjs`, open `http://127.0.0.1:4176/comparison`, select a permitted local original, and run the comparison reader. Output stays in browser DOM; any export is explicitly saved only under ignored `.private-fixtures/`. The evaluator serves local pinned dependencies and fixed repository assets; no external OCR service is used.

The existing scorer adds explicit ordered row alignment, duplicate annotation, completeness claims, declared independence, retry counts, latency and correction-retention outcomes. Missing and extra rows are counted even if they balance numerically. An unexpected extra panel claiming completeness is a false claim. Invalid/overflowing timing and retry metadata reject. It emits aggregate keys only. Example: `node scripts/score-extraction.mjs .private-fixtures/milestone-after-manifest.json`.

Private run files and truth manifests are intentionally ignored and are not release assets. Public independent tests use invented geometry/data. No image bytes, raw text, fixture paths or player identities are emitted by the aggregate scorer.

## Remaining coverage limits

- First/last lines, entirely clipped lines, single-anchor panels, colored-only values and weak/overlapping ink can escape this advisory detector. User confirmation against both crops remains necessary.
- Retry and missing-line recall have no held-out estimate. A clean row count is not a completeness certificate.
- The local private evaluator does not itself test manual-edit retention. Domain integration tests and separate real-app browser interactions cover retention; those counts must not be folded into screenshot accuracy.
- Cancel/stale/image-change guards are software contracts, not proof of OCR correctness or physical-device performance.
- More fixtures are useful only when their provenance and independence are recorded before tuning. No new user measurement is needed to continue software verification.
