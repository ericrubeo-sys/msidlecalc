# Panel detection follow-up — 2026-10-23

The user's new phone test demonstrated failed automatic area selection and an impractical finger-drawn fallback. The detector engineer read the complete lessons, screenshot release checklist, independent extraction QA, low-resolution evaluation, reader/detector and owner tests before editing. Root owns the separate mobile area editor and quiet reading screen. This document concerns geometry proposals, not equipment attribution, stat accuracy or numerical recommendations.

## Implemented boundaries

`heading-regions-3` retains the heading-only one-character tolerance and raw text. In addition to a complete OCR line, it looks for a complete heading within one to three adjacent word observations. This addresses sparse OCR combining neighboring item headings into one broad line. Word boxes must be valid, vertically overlap and have a bounded horizontal gap. The detector never divides a merged line box into guessed halves. Overlapping line/word observations are deduplicated geometrically before the maximum-anchor check.

Only approximately aligned peer headings inform horizontal panel span. A heading elsewhere vertically cannot supply the neighboring panel width. Individual observed action words can supply the lower crop boundary even when OCR groups multiple buttons into one line. Missing lower boundaries remain uncertain and can still include interface content. No final stat row or complete panel outline is invented. Roles remain null; all proposals retain review and completeness warnings.

`browser-reader-2` performs at most one additional whole-image PSM3 pass when the ordinary PSM11 pass finds fewer than two areas. A complete alternative attempt is selected only when it proposes exactly two areas. Other alternative counts leave the original attempt selected. There is no mixture of anchors from different attempts, no confidence-based numeric selection and no additional pass for explicitly reviewed regions. PSM6 item reading remains unchanged.

The original `raw` observation remains unchanged. `detectionObservations` separately retains each attempted PSM, full raw text/blocks and proposal count. `settings.detectionPsm` identifies the selected attempt, or null for explicit regions. The detection version and selected PSM enter line segmentation identity. Cancellation and stale-image checks apply after each awaited alternative operation. Each recognition raster is released before the next is allocated, avoiding simultaneous retained full-image retry canvases on mobile. All line quantities remain null/unconfirmed until the existing explicit review boundary.

## Evidence and limits

The supplied new image was privately copied and processed with the pinned local Node engine using nearest-neighbor 3× GDI rasterization, PSM11 and the same language package. The released detector already found two exact headings on **that raster**; the user's browser failure was therefore not reproduced in this diagnostic. The new detector also found two. The candidate crop's bottom changed from the image edge to an observed action-button boundary; the other crop still lacked an observed lower terminator. This is a bounded geometry improvement, not proof of complete/correct crops. GDI and browser canvas rendering are not assumed pixel-identical. Browser integration-owner checks remain necessary.

The four earlier private images were also reused at their native resolution in the Node diagnostic. Both detector versions proposed zero areas for each; the additional PSM3 pass also proposed zero. Native-resolution recognition differs from the application's 3× canvas path and is a diagnostic failure record, not an application benchmark. These previously inspected images are reused validation, not a new held-out set. Raw images and engine outputs remain in the ignored private fixture folder; no player content or fixture coordinates are encoded in public code or tests.

Sixteen owner tests pass. Added regressions cover merged headings with independent word boxes, duplicate line/word evidence, distant/vertically unrelated fragments, merged action buttons, unrelated-heading widths, exact alternative selection, preserved original observations, skipped fallback on success/reviewed regions, nonselection of an ambiguous three-area alternative, and raster release before the next recognition allocation. The full suite at this checkpoint passed163 tests including concurrent review additions. These synthetic tests verify declared behavior, not live screenshot accuracy.

## Source → requirement → implementation → verification

| Source / requirement | Implementation | Verification / remaining limit |
| --- | --- | --- |
| New user test: wrong automatic areas | Complete word-heading anchors and one alternate segmentation | Synthetic merged-line regression; supplied-image diagnostic did not reproduce the initial failure |
| Preserve raw observations and provenance | Separate raw attempts, selected PSM/version in identity | Owner reader regression checks both attempts and unchanged initial raw |
| No fabricated roles/numbers or hidden numeric repair | Geometric proposals only; existing confirmation boundary | Every detected role remains null; imported quantities unchanged/unconfirmed |
| Fallback must stay bounded/local/cancelable | One additional same-worker local whole-image pass only below two proposals | Owner tests and unchanged fixed-resource/cancellation paths; browser runtime checked separately |
| Crop completeness cannot be assumed | Explicit warnings and observed terminators only | One supplied-image crop remains unbounded below; mobile correction remains necessary |

Future improvement should evaluate independent panel-edge/stat-row corroboration against frozen private ground truth. This change deliberately does not introduce a stat dictionary as a completeness test: a dictionary could reject valid unknown effects or silently stop before an unfamiliar final line. It also does not repair glyphs, split merged numeric tokens, assign equipped status by position/color, or claim universal layout coverage.
