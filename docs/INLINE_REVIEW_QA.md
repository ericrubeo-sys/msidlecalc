# Inline review independent QA — 2026-10-24

Scope: the user's successful screenshot extraction now needs crop-adjacent editing and a clear calculation path. This review applies the latest inline-review lesson, `DATA_CONTRACT.md`, and the existing screenshot/session/parser boundaries. No private screenshots or OCR text are included here.

## Contract checks

`tests/inline-review-qa.test.mjs` uses invented records and checks:

- Formatted English quantities normalize only through a cloned correction overlay; the source observation and provenance remain intact. Recognition does not confirm a value.
- Explicit review permits valid values; blank remains missing while explicit zero stays zero. Invalid grouping, comma decimals, lookalikes and partial numeric tokens are rejected rather than guessed.
- Corrections override observations without merging repeated stats, dropping unknown labels, or converting unknown quantities to zero.
- A reread of an edited active image keeps the edited lists and invalidates their checks. It does not reassign corrections by matching labels or ordinals.
- An untouched reread or a new image adopts incoming observations rather than leaking corrections from another image. Outputs are deep clones.
- Unsupported explicit units and fractional skill levels cannot become valid merely because review was confirmed.

## UI integration checks required

Pure helper tests cannot establish browser focus, scroll, input retention, mobile keyboard behavior or privacy. The integration owner should verify input-event commits before blur; theme and crop editor navigation preserving edits; reruns preserving the edited item state; replacement invalidating old image checks; both item crops and fields visible in a single correction path; and labels/units/unknown observations remaining editable without nested per-line disclosures.

The bottom action must report the actual supported scope. Raw-line differences or an isolated independent Final Damage factor do not support a complete equipment recommendation. Critical Rate, Accuracy or other essential questions must be consumed by a supported formula or eligibility rule; adding unused fields would imply unsupported capability.

## Execution

`node --test tests/inline-review-qa.test.mjs`: **7/7 passed**. An initial test asserted a top-level `candidateValue` that the existing parser does not expose; it was corrected to check the normalized correction overlay plus `needsReview` and null effective value. The original observation remains untouched, including its grouped text.

Read-only UI review identified a restore/reread integration risk: restoring previous entries must mark that list edited, otherwise a later reread can replace the restored state. This was reported to the integration owner. The old invalid-number error also prohibited commas while the new boundary deliberately accepts strict English grouping; matching the copy to the actual grammar was requested.

Follow-up source review confirms restoration now marks the editor edited at the active image revision, and the number error gives valid grouped/dot-decimal examples. A further issue was reported where removing a spurious percent suffix kept the original percentage unit. The value-input handler now clears that inherited unit when the suffix is removed so the parser can infer the label's supported unit. These are source-level confirmations; the integration owner owns the browser retest.

Physical iPhone testing, complete battle-context recommendations and live-game validation are not established by this review.
