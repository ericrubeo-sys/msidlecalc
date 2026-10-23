# iPhone follow-up independent QA

2026-10-23. Reviewed the complete lesson record, `IPHONE_CROP_UX.md`, `CROP_COVERAGE.md`, editor/control/coverage implementation, and existing mobile/coverage tests. The six supplied screen captures are user observations, not newly held-out OCR fixtures. Reviewed only msidlecalc materials.

Observed user evidence: rapid arrow taps trigger iPhone zoom; the second-area boundary excludes part of its label column; supplied review screens retain role selectors. Cropped-out label pixels can explain missing labels, but do not establish every recognition failure's cause. Old selectors alone do not establish stale caching or mixed resources. No physical iPhone was available for this review.

`tests/iphone-followup-invariants.test.mjs` adds eight independent regression groups. A narrow DOM double runs the actual editor and replaces timer scheduling, covering:

- One short click, delayed/repeated hold, no extra movement from the held-release compatibility click, and keyboard/assistive activation.
- Stop and queued-callback invalidation on pointer cancellation/leave/lost capture, global release/blur, visibility changes, target/fine changes and reset.
- Close cancellation and cleanup of window/document listeners.
- Missing second-area seed adjacent to the **reviewed** first area; subsequent second edits survive Back/Next; valid supplied second regions are retained. A seed forced to overlap at the image edge cannot be committed.
- An excluded delta plus neighboring label does not trigger a coverage warning when an inside base value and label are present.
- Necessary static accessibility configuration: `touch-action: manipulation` scoped to crop buttons, no viewport zoom prohibition, no `touch-action: none` rule.

These tests supplement the control unit tests, original mobile geometry/cancellation tests, and reader coverage-provenance tests. They establish event/state and advisory boundaries, not native Safari compatibility, rendered layout, OCR recognition accuracy or comfortable finger use. A real iPhone retest remains necessary to confirm gesture behavior. The advisory must remain a suggestion to check the area: silence does not certify that every label, value or row is captured.

Focused result: 8/8 new regression groups pass. Full-suite result after generated release identity became available: `npm test` passed 212/212 tests. No implementation blocker found in this review. Build, rendered-browser, deployment and physical-device verification remain separate checks owned by integration or the user.
