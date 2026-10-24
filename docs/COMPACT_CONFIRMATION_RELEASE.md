# Compact item confirmation and context results — 2026-10-24

User requests independently confirmed/collapsed items, typed stat selectors, simple loading and recommendation-only context results. The former raw arithmetic transcript was noisy and included unclassified OCR fragments. It is removed from the normal flow.

## Implemented

- Each item has Confirm current equip / Confirm new equip. Confirmation requires valid visible stat selections and values, then hides its crop and fields. Edit item reopens that item with values retained and disables Calculate until it is reconfirmed; the other confirmed item stays collapsed. Rereading/new images invalidate both confirmations.
- Native stat selectors replace free-form stat labels. Entry syntax is a bounded catalog: nonnegative whole numbers, displayed percentages and cooldown seconds. Flat/percentage variants of Attack, Defense, HP, MP and Main Stat are separate. Percent fields accept7.5 or7.5% and show7.5% on blur. Whole-number fields reject7.974, negative game deltas, duplicate numbers and malformed grouping. Strict English grouping, explicit zero, safe magnitude and precision limits remain. No game cap or stacking rule is invented by the catalog.
- Unrecognized real labels remain in the editor as Choose stat plus the observed name; explicit selection or removal is required. Unclassified source fragments remain hidden session evidence and never become result rows. Catalog coverage is bounded, not a claim to support every future equipment effect.
- Calculate recommendation is enabled after both item confirmations. A checking screen paints before the separate compact context result screen. Back to items preserves the collapsed lists. No raw changes, CP scores, source fragments or unsupported numeric effects are displayed there.
- All current context recommendations abstain with Low confidence: the complete model and character/context integration are still unfinished. No arbitrary winner, formula, character-input form or numerical model release is introduced. The old isolated FD experiment remains outside the normal flow.

## Source and scope

Fresh rendered official guide2026-10-24, reported update2026-10-15: Battle §2.1 distinguishes Arena/World Arena, Colosseum, Party Quest, named Zakum/Horntail Boss/Guild Raids and Guild Training Ground. Content Guide → Content identifies Chapter Hunt, Challenge and Boss. Stat Dictionary and Battle §1.1 establish names and entry families, not complete executable replacement rules. The UI retains Chapter hunting/mobbing and challenge/boss separately. Research register updated; see ESSENTIAL_INPUT_STATUS.md for the actual mathematical gaps.

## Verification

Build, module/resource integrity, contrast checks and262 tests pass. Five new pure tests cover syntax, blank versus zero, grouping, percentage handling, skill-level/seconds contracts, explicit type changes, unknown labels and null recommendations. These are input/software contracts, not game accuracy tests.

Local actual authorized-example browser upload: missing current Attack blocked confirmation; entered8,034 then current card collapsed. Right Attack7.974 was rejected as fractional rather than silently rewritten; entered7,974 and explicitly selected Damage for the imperfect OCR label. Both cards then collapsed and enabled Calculate. Results contained only context/status/confidence, no OCR artifacts or differences. Back → Edit current retained8,034, kept candidate collapsed, and disabled Calculate until reconfirmation. No warning/error logs captured. Both themes inspected; actual390×844 phone viewport and1280×720 desktop viewport had no horizontal overflow. Physical iPhone keyboard/touch behavior remains a user retest gate.

Deployment evidence is recorded after publication. This is an OCR/UX release; full equipment recommendations remain unfinished and evolving mechanics stay on the feature branch pending approval for a later numerical release.

## Production verification

Workflow commitbcc9005 passed CI and deployment; the live authorized-example upload then passed confirmation, typed correction and context-only result checks. Both crops/forms collapsed, Calculate enabled, and eight context rows abstained with Low confidence. No raw-change or unclassified OCR rows appeared. No browser warning/error logs captured. Actual390×844 proof is retained privately in .review/compact-confirmation-production.png; results proof in .review/compact-results-production.png. The public page was reset for a fresh upload and temporary viewport overrides were cleared.

Final wording-only follow-up4256b0e aligns Methodology and description with that scope. Production CI passed: https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40098509726/job/120885669477 . Vercel production deployment succeeded: https://vercel.com/erics-trade-binder/msidlecalc/Az78MZZc3YU2rgZbXxCwayeev9nH . Public release.js and rendered Methodology both show build4cca063d3252. No force push, domain, account, paid OCR or data collection changes. Hosted/local identifiers retain the previously documented source-environment difference; the public identifier diagnoses the loaded release. Full equipment recommendations and physical-phone retest remain open.
