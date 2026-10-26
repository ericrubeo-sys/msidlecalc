# Ring comparison: minimum questions and honest completeness

2026-10-25. UX/design handoff for the current ring/OCR capability milestone. Documentation only; no UI, numerical model or approved loader changes. This handoff follows `ESSENTIAL_INPUT_STATUS.md`, `WORKFLOW_AUDIT_2026-10-24.md`, `APPROVED_LOADING_RELEASE_2026-10-25.md`, `RECOMMENDATION_INPUT_UX.md`, and the current `app.js`, typed-field registry and character-recommendation planner. It does not claim new mechanics evidence or browser verification.

## Keep the approved sequence

Upload → read locally with the approved monster animation → correct typed item rows beside each crop → confirm/collapse each item → only consumed character questions → Calculate recommendation → compact activity choices.

Preserve the animation, separate item confirmations, collapsed cards, typed stat selections, persistent units, one Advanced calculation disclosure, existing values and optional details action. Do not reintroduce raw OCR, other-readings dropdowns, source-position questions, assumption checkboxes, numerical scores or diagnostic text into the normal path.

## The supplied ring is a mechanics blocker, not a questionnaire

The complete ring pair changes Main Stat, 2nd/3rd Job Skill Lv. and Max Damage Multiplier as well as other effects. The current engine does not implement their complete replacement/conversion consequences. Correctly reading those lines does not yet make that comparison numerically eligible. Main Stat alone would not unlock the pair.

The current planner returns no character questions when these unsupported changed effects are present. Retain that behavior. Asking Attack, job, character level or a complete sheet before these relationships are implemented creates work without producing a defensible winner.

Use this compact pre-calculation message once:

> This pair changes Main Stat, job skill levels and Max Damage Multiplier. These effects are not supported yet. More character stats will not unlock this comparison.

Use **Edit items** only as a correction action if a read is wrong. Do not suggest changing a correctly read skill line to another stat, removing an effect, equipping the new item, or obtaining different equipment to bypass eligibility. Keep Calculate recommendation available to show the activity eligibility result; do not require meaningless inputs or imply the user has failed.

When the mechanics implementation expands, derive this message from the remaining unsupported effects. Never retain an old blocker after the engine actually consumes it, and never remove a blocker because a research document exists without an implemented replacement path.

## Conditional questions from implemented consumers

There is no universal character question. First run the complete-item eligibility/planning layer. A supported bound/dominance proof may use no numeric totals. A mechanics blocker takes precedence over asking numbers that cannot complete the comparison.

| Trigger after complete-item eligibility | Basic question | Exact current consumer / behavior | When not to ask |
|---|---|---|---|
| Changed supported flat Attack requires the character estimate | **Current character Attack (points)** | Current-equipped total bounds the modeled replacement response; it is not the item's Attack and not the raw item difference. | A complete proof already orders the comparison; Attack cancels; or unresolved effects already block the whole pair. |
| Changed Critical Rate or Critical Damage enters the estimate | **Current Critical Rate (%)** and **Current Critical Damage (%)** | Both feed the same critical-event expectation. Critical Damage uses the full multiplier value shown by the character screen; do not silently subtract 100. | No changed critical factor is consumed, or the pair is blocked by missing mechanics. |
| Changed supported Damage, Damage Amplification, Boss Monster Damage, Normal Monster Damage, Basic Attack Damage or Skill Damage bucket | **Current [exact bucket name] (%)** | The corresponding current bucket baseline is consumed by that changed factor. Keep distinct buckets distinct. | Unchanged factor cancels, factor is inapplicable across the supported scope, or an eligible complete proof avoids the baseline. |
| Source amplification needed by the current estimate | **Star Force (stars)** only if not credibly read | Current stage/scenario path uses the official implemented 12–30 table or the complete explicit Advanced amplification pair. | Two credible matching headers already supplied it, or the numerical path does not consume it. |
| Changed Main Stat, skill levels, Min/Max Damage Multiplier, timing or other unimplemented family | **No new question yet** | Show the concrete mechanics blocker. | Do not ask job/level/range values merely because they seem relevant; the implemented formula must exist first. |

Above actual fields, use one sentence:

> Enter these totals from Character with your current item equipped.

Keep required fields visibly labeled; examples are placeholders or help, never prefilled assumed player values. Blank remains unknown. An explicit valid zero remains zero. Preserve all entered strings when item edits change dependencies, including values moving into or out of Advanced. Returning to a previously relevant field must not require retyping it.

Automatically use the existing sourced activity list. Do not ask intended activity or a universal Basic/Skill selector; the engine must evaluate the supported branches and abstain if they disagree. No character-stat screenshot, candidate-equipped reading, job or level belongs in Basic without a new implemented consumer.

## One Advanced calculation disclosure

Advanced is the same underlying model with additional implemented information. It is not an alternative scoring engine or a route around unsupported effects.

- Keep all implemented current-total fields available for users who prefer entering them once. Extra entries do not make a missing mechanic supported.
- **Main Option Amplification (%)** and **Sub Option Amplification (%)** work as a pair. Use: **Enter both, or clear both to use the star count.** Invalid/partial explicit entries must not silently select the star path.
- **Opponent Critical Resistance (%)** remains optional. Use: **Leave blank if unknown.** Blank invokes the admitted uncertainty range; it must not become zero. One value cannot be represented as every opponent's documented resistance without evidence; context-specific admissibility remains an engine responsibility.
- Keep implemented uncertainty controls with their actual units. They are user-supplied margins, not alleged official display-rounding bounds.
- A read star count appears quietly as **12 stars · from photo** with correction in Advanced. Its provenance must remain distinct from manual editing, and a manual override survives rereading.
- Do not add job, level, total Main Stat, skill coefficients, attack mixture, range endpoints or target parameters until their implemented relationships actually consume them. Future controls require the same conditional-planning contract and unit validation.

## Quiet OCR coverage, without claiming completeness

The crop is the user's evidence. The typed rows are a proposed transcription. Confirming says the user checked those visible rows; it is not proof that automatic recognition found every effect.

| Read state | Compact presentation in the existing crop/editor | Required action |
|---|---|---|
| Valid recognized rows; no specific missing-row evidence | No success badge saying “everything found.” Optional neutral count: **6 editable lines**. | User compares crop and rows, then confirms. |
| Known stat label with unreadable or merged base/delta value | Keep its row visible, preserve the correct typed label, blank/highlight the value. On attempted confirmation: **Enter the value shown for 3rd Job Skill Lv.** | Fill the base value from the crop; never promote the colored delta or concatenate it. |
| Stat-like label is uncertain | Keep a visible row with **Choose a stat** and any reliable value. Highlight the selection. | Select the correct typed stat; do not hide the row as noise. |
| Independent crop/row evidence suggests an omitted stat row | One quiet warning directly under the crop: **A stat line may be missing. Check the crop and add it below.** | Use the existing Add line action. Focus that action only on explicit user navigation, not during typing. |
| Crop edge may cut a stat row | **Part of a stat line may be cut off. Adjust the read area or add the line.** | Existing area adjustment or typed correction. |
| OCR fails entirely | Keep both crop editors and at least one empty typed row in each. **Enter the stat lines shown in this item.** | Manual entry, then ordinary confirmation; no separate fallback wizard. |

A warning needs actual evidence, such as an unmatched stat-like observation or a row reaching a crop edge. Do not manufacture missing-row confidence from “equipment normally has six lines,” the number of OCR fragments, or the presence of six editable rows. Repeated Attack remains two distinct visible rows, automatically upper Main and lower extra in the user's comparison convention; no duplicate-removal heuristic may delete either one.

The per-item cue can stay short:

> Check each visible stat line. Add any that are missing.

Keep **Add line**, **Confirm current equip** / **Confirm new equip**, and **Edit item** as the main item actions. A missing-value highlight belongs around the actual field; do not replace it with a generic warning far below the form. Once corrected, clear that field's error and update confirmation eligibility immediately. Keep the other item's confirmation intact.

## Compact result states and exact copy

The normal result is one row per activity: activity name, **Current equip (left)** / **New equip (right)** / **No reliable preference**, and one confidence word. No ratio, score, raw delta, CP comparison or green-line vote appears.

| Cause | One shared actionable explanation | Result behavior |
|---|---|---|
| Missing required player information | **Enter [stat] to compare these items.** | Remain at the form and focus the first invalid required field on submit. Do not paint old results. |
| Entered character Attack inconsistent with admitted item-source scenarios | **This Attack total does not fit the item values. Enter your total Attack from Character, with the current item equipped.** | Highlight Attack and preserve every other entry. A low-confidence winner is not a repair. |
| Ring's unsupported changed mechanics | Use the ring blocker above once. | Activities show No reliable preference; avoid repeating the whole blocker in every row. |
| Supported model includes a possible tie/reversal | **The unknown values could change which item is better.** | No reliable preference. Only name another question when an implemented, feasible field could actually resolve this ambiguity. |
| Supported comparison is effectively equal within its admitted bounds | **These items are too close to choose reliably.** | No reliable preference. Details distinguish equality from missing mechanics. |
| Activity mechanics unsupported, including current PvP paths | **This activity is not supported yet.** in the optional details. | No reliable preference, confidence Low. Never inherit a PvE winner. |

Use **Ready to check recommendations** for the common pre-submit helper. The existing **Ready to compare for each activity** can misleadingly imply all activities are eligible even when the engine is about to abstain. Keep a single optional **Why?** / **Details** action for scope, assumptions, supported/unsupported effects, provenance and validation limits. Do not require opening it to discover an actionable missing field or the whole-pair ring blocker.

For a supported winner, **Current equip (left)** or **New equip (right)** is already the recommendation. No per-item numerical score is needed. Retain the engine's confidence and advertised offensive scope; do not promote synthetic arithmetic success into High live-game confidence or a survival/PvP prediction.

## QA acceptance handoff

1. Complete corrected ring panels reach confirmation; all skill/range lines remain editable and cannot silently disappear as noise.
2. With currently unsupported ring effects, no character-stat questionnaire appears. The exact remaining effects and inability of more data to fix them appear once.
3. A supported shoulder/synthetic fixture asks only planned consumers, retains entered values and infers the two Attack positions; matching Star Force is not a new manual question.
4. Missing, malformed, out-of-range and inconsistent inputs address their fields. Zero, blank, unknown and unsupported remain distinct.
5. Editing one item reopens only that item, preserves the other confirmation and character values, and removes stale results immediately.
6. OCR errors continue to the same typed confirmation form. Coverage cues never claim complete automatic detection or depend on a fixed expected line count.
7. Every activity is evaluated without an intended-activity question; unsupported contexts abstain. Normal results contain choices/confidence only, with one optional explanation action.
8. Existing approved photo animation, local processing, cancellation and error cleanup remain unchanged.

These are concrete acceptance cases for the implementation/QA owners, not a report that they have passed. Live-game validation, actual-phone interaction and OCR row-coverage measurement must be reported separately from software fixtures and design review.
