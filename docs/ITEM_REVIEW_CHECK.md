# Item interpretation checkpoint — 2026-10-23

Feature branch only; production remains `3f83ca9`. Latest user live testing confirms the improved crop fallback was usable, but automatic localization still failed. This iteration addresses item roles, base/delta separation and omitted visible-line losses; it does not claim to fix general localization or complete the damage model. Newly attached images are private application screenshots, not new original-game evaluation fixtures.

## Source → requirement → implementation → verification

| Source / requirement | Implementation | Verification / limit |
| --- | --- | --- |
| User: left always equipped, right candidate | `comparison-layout.js` orders exactly two distinct side-by-side regions; role selectors removed; crop steps name equipped-left/candidate-right | Independent reversed-order/ambiguous/overlap/stacked/malformed geometry tests; browser saw0 role selectors and named crop steps. User-established supported-layout convention, not an inferred game damage rule. |
| Candidate colored deltas are not extra item stats | `ocr-item-rows.js`, `screenshot-review-2`, clean base-only preview and editor | Signed/unsigned extra token retained as comparisonText, never added to base. Raw transcript explicitly labeled as including game deltas. Numeric-only fragments and merged/ambiguous tokens remain unknown. |
| Engine split label/base/delta onto different text lines | Word geometry can reassemble mutually aligned visual rows | Independent split-line/repeated-label/overlap/coverage tests. Strict lossless fallback if raw/word evidence differs; no digit repair or locale normalization. No recognition-accuracy claim. |
| Header is not an item effect | Exact On-Equip Effect heading retained in evidenceRows/provenance rather than editable stat rows | Exact heading regression; near matches and all other unknown labels remain editable. |
| Candidate omits lines lost on replacement | `manual-lines-2` optional per-list completeness flags; explicit visible-list checkbox in UI | Before completeness, missing lines stay unknown. After completeness and known reviewed values, a missing compatible occurrence becomes raw visible-line removed/added with explicit absence evidence. Repeated lines stay separate. |
| Unknown values/units/source conflicts cannot imply loss | Reliable opposite list required; same-label incompatible units/value kinds/source families block absence-zero | Independent fixtures cover missing/unconfirmed/invalid values, blank labels, unit/source mismatches and swapped exact-decimal gains/losses. Unknown visible effects still do not become mechanical weights. |
| Corrections and stale evidence | Completeness resets on edit/add/remove/review/new image; undo restores it only for same image revision | Source review plus browser edited a value and observed completeness=false/result stale. Theme-only change leaves data intact. Corrected raw value used by validation/filter, preventing blank-original corrected values being discarded. |

Build/check and all189 synthetic tests passed, including13 independent follow-up tests. Existing source-linked math boundaries remain unchanged. Browser manual fixture with invented values produced unknown unmatched lines before completeness, then explicit loss/gain afterward. This is a raw item-list comparison, not character-total reaggregation, equipment recommendation or live-game validation.

Spatial evidence retains original transcripts, raw line order and word geometry. Full raw reading stays available but is not displayed as a second numerical item value. Recognized grouping separators remain literal and need correction/review under the existing numeric parser. No automatic confirmation, paid service, storage, screenshot logging or new network path was introduced. This increment did not repeat the entire prior worker/network privacy audit.

Local review: `http://127.0.0.1:4179/`. Further production publication needs separate approval. Future localization work should be evaluated separately from base-value parsing and visible-list completeness.
