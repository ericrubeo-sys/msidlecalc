# Inline screenshot confirmation — 2026-10-24

The user requests a single quiet confirmation page even when reading fails. Both crops now lead directly to editable stat labels and values, with Add/remove controls, one final review confirmation and one visible Calculate action. The previous separate import/replace step, unit selectors, per-line review boxes and duplicated read-only preview have been removed. Photo tools and original/unclassified reading details each have one disclosure. Long labels wrap in editable text areas; values retain 16px inputs and touch controls are at least44px.

Failed or partial pair detection now opens the editor with available tentative observations and empty required fields. Coordinates are not declared successful detection; the page asks the user to check the crop. A wholly unreadable image has one empty required row per item. Missing stat values are highlighted and block Calculate; zero is never supplied for them. Area adjustment is optional. Unknown observations remain editable in Reading details and do not become mechanically understood by being hidden there. Known incomplete stats remain prominent.

One canonical list drives editing and calculation. Same-image rereads preserve corrected lists without label/ordinal remapping and reset review. New images retain the previous list for explicit restoration; restoring it protects it from a subsequent reread. Nothing is persisted beyond the page session. Original observations remain unchanged when English grouping is normalized through a transient parser overlay. This is formatting acceptance, not decimal/comma OCR repair.

The visible Calculate action reports ordered raw item differences, gained/lost reviewed lines and an explicit unavailable equipment recommendation. The optional independent Final Damage calculation is unchanged and only exposed for two lists containing that effect. No full recommendation engine or speculative character form is released. `ESSENTIAL_INPUT_STATUS.md` identifies the unfinished source replacement, critical-event and battle-context dependencies. No recommendation is enabled merely by completing item fields.

## Verification

- Build/module closure, pinned OCR resources and contrast token checks pass.
-257 synthetic/contract tests pass, including7 independently written inline-review groups. These do not validate game predictions.
- Local390×844 browser: original authorized example enters the editor directly, both crops/fields present; grouped `8,034` correction reaches raw comparison. Clearing the right Attack value highlights it, resets review and blocks Calculate with focus on that field.
- A real blank landscape raster also enters the editor directly with highlighted blank rows and no required crop dialog. Tentative crops remain available for user correction. No fake successful detection claim is made.
- Physical iPhone behavior and accuracy on new held-out screenshots remain user retest gates. The authorized example still has a blank Attack and some imperfect labels/decimal punctuation in this environment; the editor permits corrections. This release improves recovery UX, not recognition accuracy claims.

Deployment evidence will be appended after release verification. The prior production version remains authoritative until then.

Additional local browser check: theme switching preserved the entered value; same-image Read again retained corrected 8,034 and reset the review checkbox. No crop dialog was opened. Both themes were inspected at390×844 without horizontal overflow; the light mobile proof is kept in ignored .review/inline-review-mobile-light.png.

## Production verification

Commit 835022896066804d1a3ca1daa9e2f71eca317352 passed feature CI and preview deployment, then main was fast-forwarded and pushed without force. Production CI passed: https://github.com/ericrubeo-sys/msidlecalc/actions/runs/40082445045/job/120838591232 . Production Vercel deployment succeeded: https://vercel.com/erics-trade-binder/msidlecalc/BTveQn9QYnidG8FRbKmqDPH6pgRC . Public release.js reports build 6e53b1ef8a63.

The live untouched authorized-example upload reached the new editor directly: two crops,12 editable primary value fields, unchecked final confirmation and no open crop dialog. Missing Attack was visibly highlighted. Live1440×900 desktop proof is retained privately at .review/inline-review-production-desktop.png. Local1280×720 manual layout also showed two columns. No browser warning/error messages were captured. The live test page was reset to the initial upload state and temporary viewport overrides were cleared. These checks establish deployed workflow behavior, not OCR accuracy or game-model validity.

Hosted and local build identifiers can differ across source environments as previously documented; the hosted identifier is for diagnosing the loaded release. No domain, project connection, paid service or data-collection change was made.
