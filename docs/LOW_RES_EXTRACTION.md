# Low-resolution raster evaluation

2026-10-22. Data & Tooling Engineer read the full lessons and fixed extraction benchmark. Only the first two new development screenshots are eligible for tuning. No held-out image or per-image held-out output was opened for this implementation. Baseline aggregate results in the required briefing are acknowledged, not used to select thresholds. No fixture content appears in this report or public tests.

## Source-supported experiments

The official [Tesseract quality guide](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html) recommends testing rescaling, appropriate borders and segmentation; it cautions that internal binarization can perform poorly on uneven backgrounds. Its inversion recommendation is documented for4.x, so applicability to our pinned engine is an experiment rather than a measured guarantee. It lists PSM7 for a single line and13 for a raw line. Whole-column crops must not use a single-line mode without corresponding reviewed row boundaries. The [pinned Tesseract.js7.0.0 API](https://github.com/naptha/tesseract.js/blob/v7.0.0/docs/api.md#worker-recognize) supports explicit output blocks and advises sufficient input resolution. These sources justify bounded trials; none establishes an accurate transform for this game's low-resolution font.

## Implemented deterministic API

`public/domain/ocr-raster.js` adds `preprocessOcrRaster({width,height,data}, options)`. Input is bounded RGBA Uint8ClampedArray. Output is a new RGBA buffer plus complete versioned transformation provenance. No original pixels are mutated. The caller retains the original and raw OCR. This module has no DOM, OCR engine, storage, networking, logging, numeric parser, label dictionary or game-stat assumptions.

Options select `original`, `luma-invert`, or `otsu-invert`; integer scale1–6; padding0–64 output pixels; explicit nearest/bilinear interpolation; and a constant padding intensity. Defaults preserve opaque original colors at scale1 without padding. Transparent source pixels first composite against white with specified integer rounding. Luminance uses integer weights77/150/29 over256. Inversion preserves intermediate antialiased shades. Optional Otsu uses a fixed256-bin histogram and earliest threshold on ties; it can erase glyph detail and is not the preferred initial trial. Bilinear uses pixel-centre coordinates, replicated edges and one final rounding per output channel. Nearest repeats source pixels. Source/output pixel budgets reject oversized allocations.

`unpadOcrBlocks(blocks,{padding})` copies the full engine hierarchy, preserves each original `rasterBbox`, and subtracts explicit padding from `bbox`. Invalid/padding-intersecting boxes fail for review; they are never silently clamped or discarded. Existing extraction then divides by scale and adds original crop offsets. The caller should retain original blocks even on geometry failure. Include mode, scale, interpolation, padding and transform version in segmentation identity so correction certainty cannot survive a materially changed observation by accident.

## Predeclared development trials

Run these in order on the first two development fixtures only, same reviewed regions and fixed scorer. Disable the old neutral mask. Keep whole-panel raw recognition unchanged; apply transformations only to independent column proposals.

1. `original`, bilinear, scale4, padding8, paddingValue255.
2. `luma-invert`, bilinear, scale4, padding8, paddingValue255.
3. Only if useful as a diagnostic: `otsu-invert`, nearest, scale4, padding8, paddingValue255.

Compare fixed literal label/value/unit counts plus omitted/extra rows and unassigned observations. Record regressions and failed runs, not only the best result. Upscaling cannot reconstruct missing source detail; interpolation only changes engine input. Do not use digit whitelisting, O→0 substitution, punctuation normalization, truth-based row reassignment or auto-confirmation to improve scores. Freeze settings before any explicitly disclosed reused-validation run. More independent held-out fixtures remain necessary for general adoption.

Eight owner tests cover exact nearest/padding geometry, bilinear antialias values, luminance/alpha, Otsu tie policy, constant-image reproducibility, invalid/budget failure, detached hierarchy/unpadding, and explicit geometry failure. They pass. These tests establish transformation behavior, not OCR accuracy. Integration owner owns browser recognition/scoring and privacy/lifecycle verification. No application or production integration is performed by this module.

## Integration-owner development measurements

Both first-two private images were processed with the same reviewed regions and fixed literal scorer. Last-two held-out baseline images were not rerun or used to tune these variants. Whole-panel raw OCR remains the existing3× nearest observation; only independent column proposals vary.

| Column configuration | Labels exact | Values exact | Visible units exact | Omitted / extra rows |
| --- | --- | --- | --- | --- |
| Existing3× nearest, unmasked |11/22 |8/22 |5/6 |0/0 |
| Original color4× bilinear,8px padding |16/22 |8/22 |6/6 |0/0 |
| Luminance inverted4× bilinear,8px padding |0/22 |0/22 |0/6 |22/0 |
| Otsu inverted4× nearest,8px padding |0/22 |0/22 |0/6 |22/0 |

The inverted variants failed before acceptance on both images, so every expected field stays in the denominator as missing. A targeted development rerun identified the column-coordinate-map stage. Rejected raw text and complete engine blocks are retained locally with an explicit geometryNeedsReview state; they are never clamped into plausible values. Successful column observations also retain complete original engine blocks separately from mapped spatial proposals. Failure diagnostics include opaque image/run revisions to distinguish retained older observations. No raw content or file identity is logged or transmitted.

Original-color resampling/padding improves labels and unit tokens on this development set, but exact values remain8/22. This is insufficient for numerical adoption and does not resolve varying base/delta boundaries. No best-of-truth selection, digit whitelist or number substitution was added. Five independent raster invariants plus the full suite pass:124tests. See `EXTRACTION_QA.md`. The new controls are in the separate developer evaluator; application OCR and production remain unchanged.
