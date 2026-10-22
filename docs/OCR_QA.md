# Independent bounded OCR QA

2026-10-22. QA Breaker review after the manual numerical core passed. Read the Chief of Staff audit and data-contract privacy/correction gates before reviewing. Exclusive reviewer changes: this report and `tests/ocr-invariants.test.mjs`. No application OCR integration, production change, player fixture publication or OCR accuracy claim is authorized by this report.

## Session boundary checks

Latest complete suite: **81 passed, 0 failed**, including **11 independent OCR invariant tests** and six owner OCR session tests. The additional seven precision regressions cover existing mechanics exports. Fixtures are invented text/session records, not player data or an OCR-engine benchmark.

Independent assertions cover:

- Repeated, blank, Unicode and unequal panel lines preserve exact raw text/order, distinct occurrence IDs, OCR provenance and null stat/value certainty.
- Replacement with the same opaque image ID still advances image revision. Replacement/removal, cancellation, completion and a newer run all reject stale output without overwriting the active state.
- Corrections made while processing survive acceptance. Original observations remain separate. Removing a correction restores the latest raw observation and review state, never zero.
- Reordered/inserted observations at a corrected ordinal receive `changedObservation`; the old correction is retained visibly with null numerical value. It is not silently confirmed for the new line. Moved lines do not get a correction through label matching.
- Corrections for disappeared lines/panels remain in the session without reassignment to an equal label elsewhere. Image removal clears observations, corrections, metadata and active run.
- Run settings and supplied output metadata are detached from caller mutation, normal sessions JSON-round-trip, and transitions do not mutate input state. Malformed identities/text/corrections fail explicitly.
- Authoritative accepted-run settings override any output metadata pretending to describe another run. Supplied crop/box/adapter provenance is preserved and detached from caller mutation.

No confirmed numerical fields are created by this adapter. A future parser/UI must treat `userCorrected` as edited text requiring its normal typed validation, and must block automatic confirmation from `changedObservation`, even though the old `effectiveText` remains available for review. OCR engine confidence is metadata; it cannot establish field confirmation or mechanics confidence.

## Harness review and concrete corrections

Reviewed the complete `scripts/serve-ocr-evaluation.mjs`. Two concrete lifecycle defects were reported to Data & Tooling and corrected in the file:

- **Selection race before revision assignment:** the first file-change handler could wait for worker termination while a second selection completed, then resume and assign the older image a newer revision. The fix allocates a selection generation before the first await, checks it after worker termination and decoding, and uses the same guard for reset. The stale-output session token alone could not prevent this earlier intake race.
- **Closed bitmap after cached navigation:** unconditional pagehide disposal closed the image even when the page was retained in the back-forward cache. The fix retains image/session on persisted pagehide, cancels the worker, and restores controls/status on persisted pageshow. Nonpersisted unload still closes the bitmap.

These were source-level asynchronous control-flow findings; this reviewer did not reproduce them through browser automation. The corrected event ordering/disposal paths were re-read. The orchestrator owns their browser runtime checks.

The session initially discarded run settings on acceptance unless output metadata repeated them, and discarded optional per-panel crop/box provenance. Data added authoritative accepted-run settings and preserved observation metadata; the new independent assertion verifies detachment and prevents output metadata overriding the true run configuration.

## Privacy and delivery boundary

Static review found a loopback-only bind, explicit Host/method/resource allowlists, local pinned library/worker/core/language paths, `cacheMethod: none`, `workerBlobURL: false`, no-store responses and restrictive CSP. There is no image upload endpoint, text/pixel logging, persistence or remote OCR fallback in the reviewed harness. Crops are an explicit preset for the approved example, labeled as such; this is not automatic panel detection. Resource/package versions are checked on startup, while reproducible package/resource hashes belong to the evaluation manifest/lockfile review.

Read-only synthetic endpoint probes verified page/module GETs and pinned-resource HEADs return 200, unknown paths and query inputs return 404, POST returns 403, and all tested responses contain no-store and the expected same-origin connection policy. No image, name, OCR text or player stats were sent in these probes. These checks do not establish all runtime worker network/storage/log behavior; that browser evidence belongs to the orchestrator.

One integration issue was caught: the already running server continued serving its original in-memory harness function after the script file was fixed. The integration owner was informed to restart/reload before recording lifecycle/privacy evidence. A module served by reading its file on request was already current. Verify the actual served `/harness.js`, not only disk content, when reviewing a running evaluation.

No unresolved blocker found in the reviewed raw-text session core or corrected harness source. Remaining adoption gates are representative permitted fixtures with fixed ground truth and held-out cases, exact-match/error/correction metrics, repeat/browser variation, full runtime network/storage/log checks, manifest completeness, stale/lifecycle browser checks and a reviewed parser/manual integration. Current engine evaluation cannot be described as universal OCR accuracy, deterministic agreement across devices, a working screenshot-to-recommendation app or validated game mechanics. No production OCR integration was performed by this reviewer.

## Enhanced resource-gate and audit review

The subsequent evaluation update reuses a successfully initialized worker for another run. Cancellation, reset, replacement, pagehide and failures terminate the owned worker. Static review found the existing run/image-generation guards still protect acceptance; stale worker cleanup checks ownership before clearing the shared worker. Reuse permits a precise test of OCR with **new same-origin vendor fetches denied**, rather than claiming the browser network is disconnected.

Main-page instrumentation starts before the dependency bundle. It records storage-write/IndexedDB/selected console/error/CSP counts and only storage/database/cache **counts** in snapshots. Console argument bodies are suppressed for the instrumented methods. Worker globals are explicitly outside this instrumentation. An independent test executes the actual bootstrap in a fake environment, proving invented storage keys/values, database/cache names, console arguments and error bodies do not appear in the snapshot or get forwarded through the instrumented console methods. This does not certify uninstrumented worker output or every browser API.

The server audit exposes only fixed allowlisted asset paths, hashes/byte counts, served/blocked counts, method categories and rejection categories. It does not retain request payloads or rejected/private URLs. The new bodyless same-origin POST control endpoints are restricted to opening/blocking vendor-resource access; arbitrary POSTs remain rejected. This is an explicit exception to the earlier version's blanket POST rejection, and is not an image upload endpoint.

Two additional audit-precision issues were corrected by Data: the asset manifest initially hashed startup bytes but later re-read potentially changed files; it now records the hash/size of the buffer actually served. CacheStorage's count was renamed to describe named caches, rather than incorrectly calling that an entry count. The corrected source was read.

A read-only probe of the restarted `/audit` returned 16 fixed assets with valid SHA-256/byte metadata, only the four declared method categories and five declared rejection categories. No gate mutation or image/resource upload was performed by this reviewer. The integration owner owns the ensuing real-browser gate, repetition, correction, network/storage and worker-lifecycle observations. A small permitted-image result with recognizable errors is an evaluation observation, not a representative adoption benchmark.
