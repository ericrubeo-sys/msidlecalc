# Second-panel field recognition — 2026-10-23

The latest user captures show a complete reviewed second region but incorrect interpretation: adjacent base and comparison numbers merge, and border characters become item rows. This is observed field recognition failure, separate from localization. New captures remain private, as do their derived crops and OCR output.

## Source → requirement → implementation → verification

| Evidence / requirement | Implementation | Verification / limit |
| --- | --- | --- |
| Colored comparison digits join the base | `ocr-field-evidence.js` examines original crop pixels inside Tesseract symbol boxes; an exact bright-neutral prefix followed by red/yellow-green glyphs can propose a base boundary | Independent invented-raster tests plus actual pinned-engine development trials. No halving repeated strings, digit substitution or equipped-item borrowing. Color is an explicit reviewed assumption, not game truth. |
| Raw evidence and dynamic item lines survive | Original panel text/blocks retained; annotated cloned words preserve glyph evidence; unknown/repeated lines remain ordered | Base and comparison suffix remain separate strings. Malformed suffixes remain literal outside the numerical base. All proposals remain unconfirmed. |
| Punctuation bridges several genuine rows | Classify a narrow punctuation-only border alphabet before vertical row grouping; preserve observations in evidenceRows/provenance | Tall borders no longer join Attack/skill rows. Letter-bearing unknowns and numeric-only fragments remain reviewable. This is not a dictionary that drops unsupported effects. |
| Missing glyph geometry cannot restore unsafe numbers | Reader field-evidence version and word markers force unknown numerical fields on raw fallback | Independent QA found the bypass, then verified regression for both markers. Original transcript remains available. |
| Ordinary descenders make some labels taller than values | Mutual vertical overlap threshold60% of the taller box, still required for every row member | A52px label/33px value regression passes; existing cross-row bridge/overlap regressions still abstain. Tuned development geometry, not general layout validation. |
| Bounded browser-local work | Numeric word/symbol limits and eight-million sampled-pixel budget; immutable raster/block inputs | No new dependency, OCR service, storage, screenshot logging or player-data request. Reader revision/segmentation identity changes; cancellation and correction-review boundaries remain. |
| Localization still fails | Keep current detector after testing another heading-only transform | Reused development replay at production3×: latest embedded game capture0/0 panels (PSM11/3); prior original mobile image2/2; four640px originals2,0,0,0 /1,1,0,0. Color-isolated heading trial recovered no additional panels and widened one existing anchor. Rejected, not shipped. |

## Actual raster evidence

All new trials are development evidence after inspecting the user feedback, not held-out accuracy estimates. The latest attachments are screenshots of the application, not the original uploaded game file. Private crops are therefore not an exact replay of that original input.

First targeted second-area crop at2× Pillow default resampling: pinned Tesseract6-mode yielded six visible base values correctly after field annotation/assembly. The untouched transcript still contains a hallucinated colon between one base/comparison pair; it is retained in comparison evidence, never changed into a digit.

A separate production-like3× nearest-neighbor replay used explicit crops of the displayed equipped and potential-new-equip areas, pinned Tesseract7/English best-int, PSM6 and preserved spaces. Strict ordinal scoring includes nonblank spurious rows and never rematches after failures:

| Crop | Before exact labels / values | After exact labels / values | Before / after extra rows |
| --- | --- | --- | --- |
| Equipped, six known rows |0/6 /0/6 |2/6 /2/6 |6 /2 |
| Potential new equip, six known rows |3/6 /3/6 |4/6 /6/6 |3 /1 |

The equipped ordinal penalty is caused by inserted numeric/sign fragments shifting later otherwise literal correct rows; these fragments deliberately remain unknown rather than being silently discarded. Second-area skill label punctuation and one detached ordinal still require correction. The first targeted trial's cleaner reading does not override these stricter results. No claim of universal recognition accuracy follows from these crops.

Independent regression review is in `SECOND_PANEL_QA.md`. Automatic detection and general label recognition remain open. This release fixes a demonstrated base/delta failure; it does not enable equipment recommendations or validate a damage model.

All226 tests and build/integrity/contrast checks passed before release review. The user has standing authorization to publish this screenshot-reading follow-up once ready for another live test. Production status is recorded only after deployment and public checks.

Local application browser replay of the authorized example completed upload → honest localization fallback → reviewed areas → base-value cards without runtime warnings/errors. Both merged skill bases separated correctly. Recognition is still imperfect: one Attack grouping comma appeared as a decimal point, one label retained a border-like letter, and the equipped Attack was detached from its value. These literal errors are not corrected by invented arithmetic and still require manual review. This browser trial is not a six-of-six complete recognition pass.

## Release verification

Reviewed release `5f3b431105fa2f5ecf42bf2069f2f85483bc789d` passed [feature CI](https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40051152228/job/120743909469) and preview deployment before main was fast-forwarded and pushed. [Production CI](https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40051684361/job/120745527115) passed and [production Vercel deployment](https://vercel.com/erics-trade-binder/msidlecalc/DemiTgS1DUk79QLTVmfGEcWuHjNC) succeeded. No force push, domain or connection changes.

Public field-evidence module returned200 with expected version; public release.js and the rendered Methodology both showed hosted build `1723e0d8dad4`. No public startup runtime warnings/errors were captured. Local390×844 review had no horizontal overflow and retained the separate skill values through theme change. Its proof is ignored `.review/second-panel-values-mobile.png`, containing only the existing authorized public example. The newly supplied captures and derived evaluation files remain outside source control and public output. Hosted/local identities differ as previously documented; the hosted identity diagnoses the loaded release, not cross-environment reproducibility.

The deployed upload → fallback → reviewed-area OCR flow also completed with the same separated skill bases and the same remaining label/punctuation errors described above. No captured runtime warnings/errors;390×844 had no horizontal overflow. Live proof `.review/second-panel-production.png` uses the authorized example only. This verifies the targeted merging fix on production, not automatic detection or complete recognition.
