# Local workflow audit while deployment is rate limited

Scope: feature/source-linked-damage-model only. No deployment, remote push, billing or domain change. This is a primary-agent workflow/QA review, not a new independent mechanics audit or live-game validation.

## Reproduced defects and repairs

| Finding | Reproduction / impact | Repair |
|---|---|---|
| A real stat could be hidden as noise | In the original ring photo, OCR produced `3rd Job Skill Lv. 16-1`. It was grouped with non-stat observations and omitted from the visible editable fields. | Keep exact known stat-name prefixes visible. When the number/delta boundary is ambiguous, leave the value empty. Never turn16-1 into16 or1. A different unknown suffix remains an unknown stat requiring correction, not a renamed effect. Preserve the full raw observation separately. |
| Incomplete known labels could be hidden | The grouping dictionary covered only a small legacy registry, omitting many current typed fields. | Use the editor's complete stat vocabulary for prominence. Background fragments and isolated digits remain quiet; recognized or stat-like incomplete rows require correction. |
| Invalid Advanced values could silently select another path | Both amplification strings could be malformed while a valid star count existed; invalid strings became null, causing fallback to the star table. | Once either amplification field is entered, consume the pair explicitly. Require both valid percentages; clearing both returns to the star path. Keep these controls in Advanced with a plain instruction. |
| Form and engine disagreed on numerical limits | Floating-point validation accepted `9007199254740991.1` although exact engine validation rejected it. Excess fractional precision was also not rejected in the form. | Share the exact character-field validation contract. Show an inline error and prevent calculation on invalid required values. No new game rounding bound is introduced. |
| Dependency changes waited for blur/change | Browser input could change Advanced data while the old required-field list still allowed calculation. | Replan on every input and again on submit. Preserve focus/caret when a retained control moves; required amplification stays in Advanced. |

These are input, eligibility and presentation changes. The Attack/Crit/bucket equations and official Star Force table are unchanged. The contract changes are versioned as character-offense-estimate-2026-10-24-v2, item-base-rows-3 and screenshot-review-3.

## Regression and browser evidence

Eight new groups in `tests/workflow-audit.test.mjs` cover import-to-engine behavior for a merged skill line, every typed stat with a missing value, unknown-effect preservation, stat-like unknown suffixes, malformed/partial amplification, restored star-path eligibility, exact numeric boundaries and unknown resistance.

Final verification: **353 tests passed**, zero failures/skips; public build/resource/syntax and color-token checks passed; whitespace checks passed. Local build identity: `c987899e4f52`. Existing invariants retaining `Attack O` and other raw observations remain passing: label suggestions do not rewrite the original transcript or create a numeric value.

Actual local browser checks:

- Imported the user's original ring screenshot. The previously hidden3rd Job Skill line appeared with a blank highlighted value. Confirming focused that input and reported `Enter a value.` Correcting it to16 allowed confirmation. The remaining changed Main Stat/skill/range mechanics still blocked a winner.
- Synthetic Crit-only pair: item Rate10% versus20%, character Rate50%, full Critical Damage200%, Star Force12. Exactly Rate, full Critical Damage and Star Force appeared in Basic. No unused job/level or intended-activity question appeared.
- Rejected an exact out-of-range character value in the form. Entering malformed amplification immediately disabled Calculate and highlighted the pair. Completing both removed the star question; clearing both restored the already entered12 without retyping.
- With a deliberately synthetic known resistance0%, all six modeled PvE rows favored New. After changing the current item Rate to25%, the old result disappeared, only Current reopened, Candidate stayed confirmed, and character values50/200/12/0 were preserved. Reconfirmation/recalculation favored Current. These are controlled software fixtures, not measured game predictions.
- Clearing resistance to unknown returned No reliable preference; unknown was not converted to zero. PvP abstained throughout. No browser error logs were captured in the synthetic session.
- Editing an automatically read star value to1 retained typing focus; typing3 produced13, verifying focus/caret retention across field movement. Restored12 afterward. This was a synthetic edit test, not a different star reading.

Private proof: `.review/workflow-missing-skill-value.png`. No private image is committed or uploaded to a processing service.

## Remaining limits

- A label that OCR entirely fails to recognize may still be missed. Keeping recognizable incomplete rows visible does not establish complete screenshot recognition. Users must check the crop before confirming; fully manual Add line remains available.
- Main Stat, job/skill effects, complete PvP, survival, cadence and full encounter profiles remain implementation/evidence-coverage gaps. Existing research must be reconciled before extending those calculations; this audit does not establish their absence from the research. No amount of form validation establishes the missing implemented relationships.
- Opponent resistance/source-stage uncertainty may prevent a preference. Do not fill unknowns with typical values or label an ambiguous result a winner.
- Synthetic tests and desktop browser interaction do not validate live-game predictions, real iPhone keyboard/viewport behavior or arbitrary screenshot accuracy.
- Deployment remains blocked by the previously recorded Vercel rate limit. Changes are committed locally and must pass a successful preview/live smoke after publication is available.
