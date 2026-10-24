# Initial-upload recovery — 2026-10-24

The user correctly distinguished successful stat extraction **after** area forms from successful automatic upload. Earlier fixes left the initial path unchanged: missing whole-image headings led to fallback even when local crop OCR could work. This change addresses that initial route; it does not merely rename the error.

Chief of Staff lesson was recorded before implementation. Data & Tooling owned the new pure recovery module/tests; independent QA owned its integration tests/report; orchestrator owns reader/UI integration, actual raster/browser checks and release. Both specialists read the full lessons and relevant existing findings before work. All new player captures and derived observations remain private.

## Source → requirement → implementation → verification

| Requirement / evidence | Implementation | Verification / limitation |
| --- | --- | --- |
| Whole-image OCR can miss headings while a local crop succeeds | After both whole-image layouts fail, OCR one bounded pair of local layout hypotheses before reporting failure | Untouched authorized example upload now reaches Check your items without opening or confirming any crop form. Local crops are independently read; fixed coordinates alone never authorize review. |
| Avoid replacing failure with guessed success | Pure local gate requires two distinct bounded nonoverlapping areas, one exact local On-Equip heading high/left in each, intact word/transcript coverage, at least three distinct recognized label/value rows in the expected columns, no independent clipping warnings | Random/blank, one-item, missing heading, duplicate-only stats and clipped evidence still fail. Display-label anchors only help route; they do not exclude unknown effects or prove completeness. |
| Bounded work and honest provenance | One hypothesis pair only for landscape≥640×280, aspect1.8–2.5, within existing pixel budget. Accepted local readings reused. Provenance identifies local-layout-hypothesis and recovery version, not user-reviewed coordinates | No search loop, confidence-score selection, digit repair or additional network/OCR provider. Outside this layout scope manual adjustment remains available. |
| Conflicting layouts must abstain | Alternative attempt triggered by invalid layout as well as panel count; more-than-two anchors or tooManyHeadingAnchors veto local recovery | Independent QA found the >4-anchor case returning zero panels and verified the issue-based veto. Attempts are not mixed into one invented pair. |
| Preserve unknown/repeated/unequal stats and corrections | Full transcripts, blocks, observations and all item lines retained. Unconfirmed values remain unconfirmed; rejected local pair cannot replace original partial reading | Independent fixtures use different label sets and unknown effects; cancellation/stale runs reject late results and release resources. User still checks item areas and values in review. |
| Initial success must be verified separately from reread | Browser performed select file → reading → item review only | No Adjust read areas / Next / Read these areas interaction during positive local test. Existing manual fallback and reviewed-region path tested independently. |

## Raster and browser evidence

All corpus inputs are known development or reused validation evidence; none is a new held-out accuracy estimate. Actual pinned Tesseract7/English best-int with production nearest-neighbor scale replay through the reader produced:

| Known input | Whole-image panel counts | Final route |
| --- | --- | --- |
| Authorized example |1 /1 | Item review via accepted local recovery |
| Prior original mobile screenshot |2 | Item review via existing headings |
| Four previously inspected640px images |2;0/1;0/0;0/0 | First: item review; remaining three: area adjustment (clipping evidence or missing exact local headings) |
| Blank landscape negative |0 /0 | Area adjustment; local pair rejected |

Node raster replay used Pillow nearest resizing to emulate the canvas crop and actual pinned recognition. Browser canvas execution was separately checked on the authorized example: direct item review, no failure text and no runtime warnings/errors. These checks establish the targeted route improvement, not complete numerical accuracy or all-phone/layout coverage. Earlier comma/label recognition errors remain visible and require correction; this does not enable recommendations.

Independent review: `INITIAL_ROUTE_QA.md`. Original images/full outputs and replay harness live only in ignored `.private-fixtures/`. Build/check and full test counts are recorded at release review. User has standing authorization to publish ready screenshot-flow fixes; production state is recorded only after verification.

## Release verification

Build/integrity/contrast checks and250 tests passed. Independent QA supplied ten integration groups and found the too-many-heading guard gap before release. Local393×852 untouched upload showed two item previews, no open dialog and empty failure status. A subsequent blank-image upload hid review, removed old previews and offered area adjustment correctly.

Release `97c95b81bd2e931c8a39bd8d2df729b6a26ce5fb` passed [feature CI](https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40076951909/job/120822251745) and preview deployment before main was fast-forwarded and pushed. [Production CI](https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40077814773/job/120824885925) passed; [production Vercel deployment](https://vercel.com/erics-trade-binder/msidlecalc/GKZ5dkrkGPgZNQTETuEvghXaWkXh) succeeded. No force push, domain or project connection changes. Public recovery module returned200; release.js and rendered Methodology showed build `ca669bc85fcc`. Hosted/local source identities differ as previously documented; this identifier diagnoses the loaded deployment, not cross-environment reproducibility.

Public untouched upload also reached Check your items directly: two previews, review visible, empty failure status and no open dialogs. No area adjustment / Next / Read these areas clicks occurred. No runtime warnings/errors captured. Phone-sized393×852 proof `.review/automatic-intake-production.png` uses only the already-authorized public example. Site reset to initial upload state afterward. This confirms the targeted production routing change, not accuracy on every screenshot or live-game numerical validation.
