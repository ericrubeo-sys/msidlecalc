# Independent spatial extraction QA

2026-10-22. Follow-up on feature branch `feature/source-linked-damage-model`, beginning at checkpoint `9150779`. Reviewer owns this report and `tests/extraction-invariants.test.mjs` only. Read the complete lesson audit, OCR evaluation/QA records and comparison data contract before reviewing. No application changes, deployment, private fixture publication or recommendation/accuracy claim is part of this work.

## Baseline and evidence

Pinned Tesseract.js 7.0.0 local source/types were inspected independently. Structured `blocks` output is disabled by default. Its enabled block tree supplies paragraphs, lines, words and optional symbols with `{x0,y0,x1,y1}` bounds; `data.blocks` may be null. The local worker dump obtains this tree from JSON output. These are implementation-format facts, not evidence that a box identifies a mechanically correct stat/value or that OCR confidence is calibrated.

The prior known-layout evaluation demonstrated that repeatable text can still merge adjacent columns or change punctuation. This review will therefore challenge raw retention, label/value/delta association, ambiguity handling, occurrence identity, coordinate provenance, unknown-versus-zero, stale corrections and privacy. Synthetic unit fixtures will remain distinct from permitted private-image observations and held-out adoption evidence.

## Independent checks and findings

Reviewed complete spatial adapter v2, session v2, reviewed-region harness integration, literal metrics module/private scoring CLI, extraction engineer report and mechanics specialist dependency report. The saved report and new code remained nonempty after the continuation; current modules import and execute successfully.

Fifteen independent extraction/metrics/session/pixel tests passed in `tests/extraction-invariants.test.mjs`. Together with the updated damage invariant tests, the scoped review passed 37 tests. Latest full suite: **111 passed, 0 failed**. `git diff --check` produced no whitespace errors (only line-ending conversion warnings).

The synthetic tests independently establish:

- Exact raw/newline retention, blank and repeated occurrences, unequal row sets and high-confidence observations remaining unconfirmed.
- Separation of wholly contained base/delta words under explicitly reviewed lanes, without addition, digit splitting, leading-zero normalization or sign removal.
- Boundary-spanning merged tokens remain unassigned; missing columns/blocks preserve evidence without inventing values. Punctuation/lookalikes remain raw ambiguous proposals.
- Original-image coordinates reflect crop and scale; output detaches from caller mutation and remains JSON serializable for tested inputs. Malformed/outside boxes, overlapping lanes and derived-geometry overflow reject.
- Column assembly uses source-space vertical overlap, unique in both directions. Ambiguous many-to-one and exactly-half overlaps do not assign a value; unmatched observations remain retained. This tests the declared heuristic, not semantic correctness on every layout.
- Identical repeated text at the same ordinal under a changed segmentation identity retains the correction but changes its state to `changedObservation`. Reaffirming it under the new identity restores `userCorrected`; repeating that same identity preserves it. It never creates a confirmed number.
- Literal ordinal metrics retain failed fixtures and missing panels/rows in denominators; null unreadable truth is counted separately. No label/value rematching or numeric punctuation normalization occurs. Output is counts only, and CLI rejection does not echo a private-looking file identifier.

Two concrete source-level issues were raised and resolved:

1. **Segmentation drift could retain a correction without a warning despite identical OCR text.** Root added explicit segmentation identity to session provenance and correction records; the harness supplies crop, scale and cuts. A changed identity now invalidates correction certainty. Any future material segmentation/preprocessing change must update that identity rather than rely on raw-string equality.
2. **Finite input geometry could produce infinite source coordinates.** Very large finite crop offsets/extents could overflow during coordinate mapping and serialize as null. The extraction owner added crop/scaled-extent overflow rejection and an owner regression; the independent malformed-geometry assertion passes. Actual harness bitmap limits already prevented this synthetic extreme.

The owner also removed terminal whitespace from assembled label proposals, consistently with value proposals, while preserving original column text. This is presentation of a proposal, not normalization in the literal scorer.

## Source interpretation and model boundary

The mechanics specialist's complete `DEPENDENCY_RESEARCH_2026-10-22.md` was read. Its attributed rendered Korean guide §4.2 says after level100 alongside inclusive ranges; the same-date English inclusive ranges plus Korean wording support assigning gained100 to the preceding band and gained101 to the next. The updated independent damage test checks that interpretation, reciprocal cross-band arithmetic, Korean provenance and the explicit regional/build caveat. The previous English-only rejection was superseded by additional source evidence, not by choosing a lower-confidence guessed number.

This reviewer did not independently render those source tabs. Cross-language corroboration supports a narrow publication interpretation; it does **not** establish regional server/build parity or live-game agreement. The helper remains isolated and every complete Arena/World Arena/Colosseum result remains unsupported. Before using it in an actual regional recommendation, a compatible evidence/context profile remains necessary. No Main Stat conversion, critical/range law, cooldown order, general boss equation or sustained DPS was fabricated.

## Privacy and adoption recommendation

No new provider, upload endpoint, pixel/text logging or persistence path was introduced in the reviewed integration. Structured word output is requested explicitly, processed in browser memory and displayed through text content. Module resources are fixed same-origin files; the prior audit/gate limitations remain. This is source-review evidence; integration-owner browser checks remain separate.

Build and preserve this as reviewable evaluation tooling. Do **not** adopt automatic numerical extraction into the application yet. Unique vertical overlap can still produce a semantically wrong association; reviewed global column cuts can clip a base value on one row while including a comparison sign on another. The integration owner's development-image findings show that this remains a real limitation, even where the current item's proposals improve. All proposals must remain editable, unconfirmed and outside a recommendation until the application adapter and representative permissioned held-out evaluation clear their gates.

## Optional neutral-text evaluation transform

Root added `ocr-preprocessing.js` mask version `neutral-text-mask-1`, default off in the harness. It processes only reviewed label/value column proposals; delta-column OCR and whole-panel raw/box observations remain unfiltered. The settings and per-column preprocessing provenance are recorded, and segmentation identity includes mask mode/version plus extraction version. All proposals remain unconfirmed. No application OCR integration occurs.

Three independent pixel test groups passed. The tests check inclusive brightness/chroma/alpha boundaries, the inversion to grayscale text on opaque white, retained-pixel counts, same-input determinism, input nonmutation/settings detachment, and malformed/oversized-buffer rejection. They explicitly demonstrate the semantic limit: a colored base value is removed just like a colored comparison value; neutral comparison text can remain just like neutral base text. This is a versioned pixel transform under an assumption, not a detector of base values or item identity.

No new code blocker found for retaining this opt-in evaluation path. Original pixels/whole-panel observations must remain available, missing masked content remains unknown, and corrections cannot stay confirmed across mask-mode changes. Known-layout improvements are development observations; they do not establish representative accuracy, general layout handling or production adoption. The integration owner owns browser runtime measurements and their private ground-truth evidence.
