# Independent initial-upload routing QA

Reviewed the initial-routing correction in `LESSONS.md`, second-panel evidence, reader orchestration, heading detector, fixed left/right layout contract, local recovery acceptance and current application route. This review keeps panel localization, field extraction, numerical confirmation and physical-phone usability separate.

## Source → requirement → implementation → verification

| Requirement from the user and prior failure | Independent verification |
| --- | --- |
| A correct reading after fallback is not successful automatic intake | Injected-worker test starts `reader(image)` with no reviewed regions, requires `route:itemReview`, locally evidenced two-panel assignment and exactly four OCR calls. Actual browser upload remains a separate release gate. |
| Coordinates alone must not count as detection | Blank/random crops, high confidence without evidence, one item, missing heading and repeated copies of only one known stat retain `needsAreas`. |
| Dynamic unequal item lines and unknown effects survive | Accepted fixture uses three different known labels on each side, plus an unknown effect. Both full transcripts, whole-image observations and all unconfirmed raw lines remain. |
| Rejected recovery must not replace or mix original proposals | One original partial proposal and its reading survive rejected local recovery; original detection PSM remains11. |
| Contradictory multi-item evidence must not be bypassed | Three heading proposals suppress seed OCR. A further five-heading regression exposed a guard gap: detector returns zero proposals on `tooManyHeadingAnchors`, which initially looked like missing evidence to the reader. Integration now retains per-attempt detector issues and vetoes seeded recovery for this condition; regression passes. |
| Clipping must not be ignored | Two independent whole-image label/value rows outside a seed boundary veto an otherwise qualifying local pair. No warning is still not proof of complete coverage. |
| Manual correction remains available without repeating automatic recovery | Explicit reviewed regions skip alternative whole-image and seeded recovery passes; accepted seed readings are reused without another crop OCR. |
| Added work remains bounded | Portrait, small and extreme-aspect inputs skip recovery; at most one pair is tested, with no search loop. |
| Replacing/canceling the image cannot publish stale drafts | Abort during a pending local pass rejects promptly, releases canvases and terminates worker. Late completion is ignored; stale revision after the first crop prevents a second local pass. |

The test fixture uses injected OCR observations, invented word/symbol boxes and a solid neutral raster. It exercises reader sequencing, actual field annotation, geometric acceptance, cancellation and raw-data retention. It does **not** evaluate real character recognition, image layout diversity, mobile timing, iPhone gestures or live-game mechanics. Three recognized label/value rows only justify showing unconfirmed item drafts; they do not prove the item list complete or every value correct.

Owned files are `tests/initial-route-qa.test.mjs` and this report. No private player images or OCR transcripts were added to public files or test fixtures. Final focused result: **10/10 passing** after the ambiguity fix (2026-10-24, client date). No remaining blocker found in this independent integration review. The orchestrator owns actual untouched upload → review browser evidence and deployment verification.
