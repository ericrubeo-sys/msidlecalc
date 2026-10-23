# Item comparison follow-up QA

2026-10-23. Independent QA of the user's live-test correction, after reading the complete lesson record, data contract, screenshot-review and raw comparison modules. Scope is item identity, base-versus-displayed-delta separation, lossless row assembly and reviewed visible-list absence. The user's supplied photos are review context; no player image or transcription is included in public fixtures or this report.

The user establishes the supported screenshot layout: equipped item on the left, candidate on the right. Asking for those roles again is unnecessary. Geometry still has to identify two distinct side-by-side areas. The candidate's colored comparison numbers are evidence to retain, not a second contribution to the item's base value. They do not enumerate every lost stat, so replacement comparison must use both item lists.

## Independent verification

`tests/item-comparison-followup.test.mjs` passes **13 independent tests** against the actual implementation, using invented text, quantities and coordinates. These establish implementation behavior, not recognition accuracy, game formulas or live-game validation.

- Reversed proposal order still assigns the left area to equipped and the right to candidate. Missing, duplicate, overlapping, vertically stacked and invalid regions do not produce item assignments. Assignment does not confirm any numerical field or mutate the source proposals.
- Both signed and unsigned displayed changes stay separate from the proposed base quantity. Split OCR label/value observations can be grouped by mutually consistent word geometry. Repeated labels remain separate occurrences. Overlapping boxes, merged numeric strings, lookalikes and three-number ambiguity yield unknown fields rather than guessed numbers.
- Missing word coverage falls back to every original line. Original transcript, structured observations and raw-line evidence remain retained. A row-grouping success is not an assertion that OCR read the characters correctly.
- Unmatched lines remain unknown by default. An explicit complete *opposite* visible list permits a confirmed present occurrence to be described as added or removed, using zero only for that reviewed absence. Unknown, invalid, unconfirmed or unlabeled present quantities cannot supply an arithmetic change.
- Incomplete/unconfirmed opposite occurrences block absence arithmetic despite a completeness flag. Same-label incompatible units or source families do not become a certain gain and loss. Duplicate excess occurrences are retained and require the opposite-list completeness condition.
- Tiny exact decimal changes preserve sign when reversed. Unknown labels remain raw. All outcomes retain unavailable damage, null winner and null damage percentage.

## Findings and source review

The initial implementation could treat a confirmed numeric quantity with an empty label as a lost line against a complete empty list. The independent regression exposed this; the owner added a present-label requirement, and the regression now passes.

Application source review confirms role-selection questions were removed in favor of the fixed-layout helper. Draft import is still an explicit action, and numerical lines remain individually reviewable. The visible-list checkbox resets on edits, additions, removals, line confirmations, replacement and image changes. Restoring previous entries restores completeness only for the same image revision. Changing a theme does not touch those records.

A second source issue was reported: submission validation and meaningful-row filtering originally consulted the original raw value rather than an effective correction. A corrected value on a formerly blank OCR occurrence could be silently omitted if its corrected label remained empty. The owner added a shared effective-value accessor, and independent source reinspection confirms both the submission guard and meaningful-row filter now consult the correction first. The 13-test independent suite passes after that change. No numerical recommendation was enabled by this issue.

## Remaining limits

The raw OCR disclosure intentionally shows the original transcript, including displayed deltas. The editable item quantity uses the proposed base value; the delta is subordinate evidence. A separated proposal remains unconfirmed and may still contain OCR errors or ambiguous units. Visible-list completeness does not establish hidden item effects, full character totals, valid aggregation, damage impact or a recommendation.

Automatic area detection reliability and mobile touch usability require separate runtime evidence. These unit and source checks do not certify either. Production release remains a separate user approval decision.
