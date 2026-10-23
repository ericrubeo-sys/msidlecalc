# Screenshot-flow independent QA

2026-10-23 continuation, feature branch starting at `2ffa4c5`. Read complete lessons, data contract and extraction QA/privacy gates before review. Reviewer owns this report and `tests/screenshot-flow-invariants.test.mjs` only. No private images or held-out proposals are opened for tuning, and no production deployment is performed.

## Scope and adoption boundary

The user's request permits an experimental upload → extraction → editable review flow in a feature preview. It does not permit OCR confidence to confirm fields, poor recognition to be advertised as reliable, stale output to overwrite a newer image, or reprocessing/import to erase manual corrections. A reviewable application flow is different from automatic numerical adoption and a validated equipment recommendation.

Every extracted occurrence must retain original text, order, units/unknowns and provenance. Numerical consumption still requires explicit user confirmation through the existing typed validation. Missing/unreadable quantities remain unknown; repeated, unequal and unsupported lines remain visible. The same structure/state must survive theme changes and ordinary review navigation. Screenshot bytes/text/corrections remain browser-local and ephemeral; fixed local dependency fetches are distinct from uploading player data.

## Independent verification

Reviewed the complete pure screenshot-review adapter, heading detector, browser reader, vendor copier/verification path and build/hosting changes. **15 independent tests passed** in `tests/screenshot-flow-invariants.test.mjs`. Latest full suite: **147 passed, 0 failed**. `node scripts/vendor-ocr.mjs --verify` verified **23 fixed resource/license files** and their manifest against pinned installed packages. This is unit/code/packaging evidence, not a new recognition benchmark.

The independent assertions exercise the actual shared `createItemLine` / `parseItemLines` consumer, rather than merely checking the import object's flags:

- Role assignment must be explicitly confirmed and select two distinct existing panels. Import follows that assignment, never input order, and retains unequal, repeated, blank and unknown occurrences.
- Original raw text/provenance remain detached from caller mutation; imported proposals cannot become effective numerical quantities even with engine confidence 100.
- Separator strings and comparison tokens are preserved without arithmetic, digit splitting, lookalike substitution or comma normalization. Unparseable merged tokens remain unknown drafts.
- Edits create correction overlays without erasing observations and invalidate both confirmation and reviewed-image state. Explicit confirmation still cannot make a malformed numeric string valid. Blank remains missing; reviewed explicit zero is a true zero quantity.
- A changed image revision invalidates top-level and correction confirmation while preserving edited text and unrelated manual entries. Reimported runs get distinct observation identities and do not mutate prior edited records or rematch repeated labels.
- Confirming every valid OCR field still produces no equipment/DPS recommendation through the existing comparison domain.
- Heading detection returns bounds requiring review with null item roles and unconfirmed visible completeness. Missing/one-panel/excess-anchor cases do not fabricate a counterpart.
- Cancellation while recognition is pending rejects output and releases canvases/worker. A worker finishing creation after cancellation is disposed before any screenshot recognition. Superseded image state after an awaited recognition rejects rather than returning proposals.
- Dependency errors expose a fixed redacted failure code; configured worker/core/language URLs are fixed local resource paths with no player-derived query or pathname. Language caching is disabled and worker blob URLs are disabled.

## Packaging and privacy source review

The reader overrides upstream CDN defaults with absolute same-origin worker/core/language paths, requests raw text and structured blocks, and exposes no upload, storage or screenshot logging operation. The source image is caller-owned; temporary canvases are released in `finally`, including failures. Whole-image and panel observations remain retained on successful completion. Normal recognition failures do not return a fabricated partial result.

Generated public vendor files are an explicit fixed list from pinned installed packages, not a copy of private fixtures or project directories. The copier verifies package versions, output paths and unexpected output files/symlinks, includes dependency notices, and emits exact byte/hash metadata. Build installation explicitly includes the required dev packages without dependency install scripts. Project validation verifies vendor integrity before excluding these known binary/library assets from the normal source scan. This review does not provide a licensing/legal opinion.

No screenshot/player data was read, sent or published by these tests. Browser network/storage/log inspection of actual selection/recognition/correction/failure/reset remains a separate integration-owner check. A static same-origin resource configuration is not, by itself, complete runtime privacy proof.

## Verdict and remaining integration gates

No blocking defect found in the reviewed helpers, reader or fixed-resource packaging. The saved files remained nonempty after the continuation and imported successfully. The new application UI was still being implemented at this handoff; it is not certified by the pure-module checks.

The integration owner must verify that both raw comparison and partial-factor calculation consume image-gated records, that populated/manual editors require explicit replacement before imported drafts are applied, and that reruns stage proposals without overwriting edits. Item roles and every OCR occurrence need explicit review; no bulk recognition-confidence acceptance. Confirming unknown values must not imply zero or complete gear effects.

Runtime checks must cover unblurred edits, canceled/stale reads, image replacement/removal, failures and recovery, theme/focus/scroll preservation, role swapping, malformed/unknown/unequal lines and local network/storage behavior at realistic viewports. Poor current recognition remains an adoption limitation. The user-authorized experimental review flow can be useful without claiming reliable automatic numeric adoption, full equipment extraction, supported battle recommendations or live-game validation. Production release remains outside this review.

## Integrated source and heading-v2 follow-up

The integration owner's subsequent heading detector permits one character of OCR error in the normalized **heading only**, marking approximate matches and retaining the observed heading. An independent regression checks exact-plus-one-character headings yield two unassigned review proposals, distant text yields none, inputs/raw headings remain unchanged, and a stat-line `O` remains unparsed rather than becoming zero. This change improves a candidate-region proposal; it does not confirm panel bounds, current/candidate role, stat labels or numerical values.

Latest application source was inspected after UI integration. Both raw comparison and partial-factor calculation call `recordsForImage` before parsing. Applying drafts is explicit, requires distinct reviewed role assignment, and saves previous editor entries for an Undo/restore action. Reading again stages proposals rather than replacing manual rows. Per-line edits commit on input, retain observation text and uncheck confirmation; invalid typed values cannot become confirmed through the checkbox. Recognition status remains an experimental draft claim. These are source checks; the integration owner's real-browser verification remains separate.

One minor source issue was reported to the owner: the review-count summary initially included only nonblank original OCR text. Editing a retained blank OCR occurrence into a meaningful label/value could therefore leave it out of pending/total counts despite the row still requiring review. Numerical gating remains correct; the summary should count nonblank effective corrections as well. Owner resolution should be checked before the final UI handoff.
