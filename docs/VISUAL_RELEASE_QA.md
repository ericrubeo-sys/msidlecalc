# Visual release independent code and domain QA

2026-10-22. Independent QA Breaker review of the working tree based on `a54695a`; no commits or code changes by this reviewer. Read the Chief of Staff audit in `LESSONS.md`, `DATA_CONTRACT.md`, `MODEL_QA_AUDIT.md`, project instructions and the current execution request before reviewing. Browser, rendered viewport, network/storage runtime and deployed-site checks belong to the integration owner and are not asserted here.

## Result and limits

No unresolved release-blocking defect found in the reviewed manual-line module or application code. This is a usable manual raw-line comparison with a local screenshot reference. It is not OCR, a damage calculator, a validated mechanics implementation or a working report/contact delivery service. Those limits are stated in the page and dialogs. Raw improvements never become an equipment recommendation.

`node --test tests/*.test.mjs`: **19 passed, 0 failed**. Fixtures are invented parser/algebra examples; they provide no live-game validation. Existing arithmetic primitives remain outside the application comparison path.

Additional independent, read-only Node assertions passed:

- Canonical signed/leading-zero decimals and negative zero; blanks, null, unreadable text and unsupported suffixes remain unknown or invalid.
- Exact subtraction at 18 fractional places against the technical maximum; exact signed-extreme subtraction remains a decimal string. These technical bounds are not game caps.
- Distinct units and rejection of fractional skill levels; repeated and unequal occurrence sets remain separate in existing tests.
- Original observation retained under correction; removal of correction restores the original `needsReview` state rather than confirming it.
- Unknown same-label values retain raw comparison and a null damage winner. No arbitrary offensive weighting or aggregate replacement occurs.

## Application review

- The result renderer uses `effectiveValue.decimal` and `differenceDecimal`, preserving the module's exact strings. The numeric convenience fields can round at precision extremes and must not become future calculation inputs.
- User labels and values enter DOM text through `textContent`; no HTML interpolation was found. Dynamic lines are independent per item and can be added or removed. Invalid values block comparison without clearing other records. Missing values do not become zero. Edits mark existing results stale.
- Theme application changes the root theme attribute/status only. It does not replace inputs, records, selected image, disclosures or results. Runtime focus/scroll preservation still requires the integration owner's browser check.
- The image flow uses a local object URL, MIME/size checks, decode error handling, replacement/removal revocation and an image revision guard. Manual entries remain in memory. There is no OCR worker or fabricated extraction.
- Static inspection found no screenshot/stat network operation, telemetry, persistence, console logging or report/contact send operation. Only appearance preference uses local storage. The fixed external MapleStory.io leaf is disclosed. This is code-review evidence, not a runtime network/privacy certification.
- Support configuration is a single null destination. The disabled, compact placeholder cannot enable payments merely by supplying a URL. Contact and bug dialogs explicitly state delivery is unavailable.
- The exact example screenshot has the user's explicit publication authorization. That exception does not authorize publishing other player fixtures.

## Integration observations

Two transient issues were reported immediately while files were being integrated: the example initially referenced a nonexistent `.png` while the asset was `.jpg`, and `app.js` was briefly absent. Both were resolved in the subsequent reviewed snapshot; the HTML references the existing JPG and the application module exists. These are not outstanding findings.

The explicit appearance status still used generic `Light skin` / `Dark skin` at review time. The integration owner acknowledged the requirement to use the source-site names and owns that small correction plus verifying exact site spelling/capitalization. The select labels already use `BasilMarket` and `Hidden Street`. Confirm the final status and source-name evidence before release.

The correction API intentionally retains the observation's unit unless a correction supplies one. The manual editor exposes an explicit unit selector. Future OCR correction UI must preserve that explicit unit choice rather than silently remapping units when a label changes.

## Remaining release checks owned by integration

Review realistic phone portrait and landscape, tablet and desktop in both modes; full image and annotations; header/control/footer sizing; image/error/removal behavior; repeated/unknown/unequal manual lines; stale results; keyboard/dialog behavior; theme state/focus/scroll preservation; runtime network/storage privacy; remote diff preservation; deployed commit and actual public-site behavior. Passing this code review does not assert those checks have happened or that deployment succeeded.
