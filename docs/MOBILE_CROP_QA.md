# Mobile crop correction QA — 2026-10-23

Independent review of the user-reported real-phone failure and the resulting UX specification. Reviewed full `LESSONS.md`, `MOBILE_CROP_UX.md`, `SCREENSHOT_RELEASE_CHECK.md`, application markup/styles, reader/detector, crop editor and geometry. The supplied screenshot is development evidence; no private image or player text is reproduced here. Production was `71544b3` at review start; these changes are a feature checkpoint until separately released.

## Findings and regression coverage

| Requirement / observed risk | Review and verification |
| --- | --- |
| No precision finger dragging required | Editor exposes Move box and each edge through native selection plus four large direction buttons. Geometry stays in original integer pixels. CSS sets direction buttons to at least52px high, other crop controls48px. Browser layout and physical touch usability require separate evidence. |
| Fine correction must reach individual pixels | Initially fine mode moved0.2% of the image, so large images skipped several pixels. Root corrected this to one original pixel; independent test covers all four directions on4000×1700. |
| Clamp without crossing or inverting edges | Independent repeated-tap test covers8×8,37×19,1280×590 and4000×1700 geometry, all targets, both step sizes and every direction. Movement preserves size; edge adjustment preserves its opposite edge. |
| Cancel is transactional across both steps | Narrow DOM event double adjusts both areas, cancels on step2 and verifies no input mutation or apply callback. Closing twice invokes onClose once and returns focus to the launcher. This does not certify native-dialog behavior in every browser. |
| Back and Reset preserve the other draft | Independent test moves both drafts, returns to step1, resets it, then explicitly applies. Step2's changed draft survives. No implicit apply during navigation. |
| Enlarged view must not oscillate on every tap | Independent canvas-call test verifies small consecutive horizontal/vertical nudges retain the same source view frame. It does not measure legibility. |
| Avoid reading the same item twice | Root added greater-than80%-of-smaller-area overlap guard. Independent identical-region test verifies native-disabled Read these areas prevents submission. Distinct geometry still does not prove distinct item identity. |
| Native controls retain keyboard behavior | Independent event test verifies irrelevant edge axes are disabled and select arrow keys are not intercepted. Root added selected-edge-specific accessible direction names. |
| Canceled image decoding must not restart OCR | Source review found cancel left the pending onload path able to start reading. Root added readOnDecode gating; latest source captures that flag before conditionally starting. This path needs browser verification in addition to source review. |
| Superseded alternate detection must not return data | Independent pending-alternate-PSM test aborts while the second recognize call waits; returned promise rejects AbortError and all rasters/workers are disposed. Late completion cannot return proposals. Existing reader tests cover stale revision checks. |
| Failed/canceled adjusted reading must not attach old text to new bounds | Final source review verifies cancel and current-run finally restore outlines from the latest staged reading of the same image revision. This changes only outlines, preserving role selections and edited lines. Successful new reading replaces the staged source before restoration; stale-image restoration is guarded. |
| Automatic detection improvement is bounded evidence | Reader retains initial raw output and both detection observations, selects alternatePSM3 only when it independently yields exactly two proposals, and never confirms roles/lines. Detector uses observed word boxes for merged headings rather than cutting a broad line into guessed halves. Synthetic tests are not field accuracy measurements. |

Initial source review also found seed crops could be smaller than the geometry's8px minimum, including legitimate narrow detector proposals. Root now rejects malformed/out-of-bounds/undersized prior regions in favor of a broad unconfirmed seed. An independent1×1 bottom-right detector fixture verifies it can be nudged/submitted without mutating caller data or throwing. Images smaller than40 pixels on either axis receive a graceful application message instead of opening an invalid crop editor. Coarse steps deliberately use2% of the original axis for fewer taps; Fine adjustment is one original pixel.

## Checks and limitations

At the final reviewed checkpoint, all167 tests and `npm run check` passed. Ten independent tests live in `tests/mobile-crop-invariants.test.mjs`. The DOM double tests transactional behavior and event wiring only; it does not exercise an actual rendering engine, scrolling, focus trapping, finger occlusion, phone browser chrome, or orientation changes.

Loading-stage CSS hides other intake children and the selected-image flag hides example/legend/availability. No Show example control remains. Reading uses a concise state without OCR transcript announcements. Root owns actual viewport checks, quiet result/failure presentation and private-fixture area-coverage inspection. Physical-phone usability remains unverified until the user tests this iteration. OCR text accuracy, equipment recommendations and empirical damage validation are separate claims.

The final rendering pass adds outside-area shading, a numbered locator and a white dashed selected edge. The canvas double now supplies the standard drawing methods used by those paths; all167 tests and project checks were rerun successfully after that change. Rendering intent was source-reviewed; no visual legibility claim is inferred from no-op drawing stubs.
