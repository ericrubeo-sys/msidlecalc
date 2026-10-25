# Automatic equipment metadata independent QA

2026-10-24 follow-up. User requested automatic Main/Sub Attack attribution by upper/lower row convention, automatic yellow filled-star reading and fewer mandatory controls. This audit covers the metadata helper, not a new combat model.

## Required acceptance behavior

- The upper/first Attack point row receives Main and the next lower Attack point row receives Sub under the user's explicit review convention. Non-Attack lines, Attack percentages and extra repeated Attack sources must not accidentally consume those positions.
- An explicit manual Advanced source-role correction wins over automatic inference. Re-importing or editing metadata must not silently replace the user's override.
- Yellow filled stars in a bounded tooltip-header area are counted; empty gray outlines are not filled levels. Missing or low-quality star evidence is unknown, never zero.
- Matching readings from both item headers may populate the shared slot level. Conflicting header readings must not choose a convenient side.
- A manual star value remains a manual override. New-image handling clears only automatically derived star evidence; it does not overwrite retained manual player values.
- Metadata derivation remains deterministic and does not mutate retained OCR observations. Crop/image revision handling must prevent old asynchronous evidence from attaching to a new image.
- Numerical model blockers remain blockers. Inconsistent character Attack, changed Main Stat/skill effects and unsupported activity rules require a concrete reason; automatic metadata cannot manufacture a winner.

## Verification status

Independent fixtures are implemented in `tests/automatic-equipment-metadata-independent.test.mjs`. **Final run:21 groups passed**, using `node --test tests/automatic-equipment-metadata-independent.test.mjs`. An earlier20-group run found four failures, all repaired by the star-reader owner and independently rerun:

1. A16-star item with one filled second-row star was read as15.
2. A vertically truncated17-star header exposing only the full first row was read as15 rather than unknown.
3. A non-prefix pattern,12 stars on row1 plus a filled row2 star, was read as12 rather than unknown.
4. Solid yellow rectangular text-like blocks at the grid spacing were accepted as12 stars; color and spacing alone were insufficient shape evidence.

The repair retained short second-row evidence after locating the first grid, required sufficient lower-header coverage, rejected non-prefix lower rows and checked star silhouettes. Matching12-star headers, a2× scaled star fixture, levels16/17/20/25/30, disagreement, gray/missing/transparent evidence, gold outside the header, duplicate-panel rejection, automatic role ordering, spatial/ordinal ordering, extra-source ambiguity and manual/reset state fixtures all passed.

Static integration review found the asynchronous read revision/run checks before metadata adoption, automatic role synchronization on edit/add/remove/confirm, manual star origin tracking and new-image clearing of only automatic star values. No numeric combat model was changed by this metadata audit. Browser integration, screenshot accuracy and actual-device usability remain separate integration-owner checks.

Two UI findings were repaired by the integration owner and statically rechecked: an automatically read6–11-star level no longer hides the required unsupported-stage correction in a closed Advanced section; and an inconsistent-input message now gives the Attack-specific prompt only when Attack caused the issue, otherwise retaining the concrete Critical/Damage reason. The helper fixtures do not certify those DOM behaviors.

The integration owner separately reported browser verification of automatic Main/Sub roles, removal of the essential checkboxes, six PvE Current results for synthetic consistent totals and PvP abstention; the combined suite passed345 tests. These are attributed integration-owner observations, not independently repeated browser checks by this QA specialist. Real-image local raster reading was checked separately by the reader owner. After initial file-chooser timeouts, clicking the visible upload label resolved browser import. A fresh session with the user's original ring screenshot reached review, confirmed both cards without Attack-source questions, and displayed “12 stars · read from both items” with the populated value in Advanced. Changed Main Stat and skill effects produced a concrete blocker instead of a manufactured winner. This verifies browser adoption on that image, not general screenshot accuracy.

No remaining arithmetic or metadata-helper blocker was found within the tested contract. This is not a measured real-image reliability rate. In particular, conservative unknown outputs for unreadable headers are expected; matching synthetic stars do not establish OCR accuracy for arbitrary screenshots or validate the combat recommendation model.
